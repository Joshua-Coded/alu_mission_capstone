import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GovernmentDepartment, ProjectCategory } from "src/users/schemas/user.schema";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { UsersService } from "../users/users.service";
import { AssignDueDiligenceDto } from "./dto/assign-due-diligence.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { RejectProjectDto } from "./dto/reject-project.dto";
import { UpdateDueDiligenceDto } from "./dto/update-due-diligence.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { VerifyProjectDto } from "./dto/verify-project.dto";
import { ProjectAssignmentService } from "./project-assignment.service";
import { ProjectsService } from "./projects.service";

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    HttpStatus,
    HttpException,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        role: UserRole;
        email: string;
        sub?: string;
    };
}

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly projectAssignmentService: ProjectAssignmentService,
        private readonly usersService: UsersService, 
    ) {}

    // ==================== FARMER ENDPOINTS ====================

    @Post()
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Create and submit project directly to government (Farmer only)' })
    @ApiResponse({ status: 201, description: 'Project created and submitted successfully' })
    async create(@Body() createProjectDto: CreateProjectDto, @Req() req: RequestWithUser) {
        console.log('=== CONTROLLER DEBUG ===');
        console.log('Request user object:', req.user);
        console.log('User ID:', req.user?.userId);
        console.log('User role:', req.user?.role);

        if (!req.user || !req.user.userId) {
            console.error('Missing user data in request:', req.user);
            throw new HttpException(
                'Authentication failed: missing user information',
                HttpStatus.UNAUTHORIZED
            );
        }

        // Create project and auto-submit to government
        const project = await this.projectsService.create(createProjectDto, req.user.userId);
        
        // Auto-categorize by department immediately
        try {
            const categorization = await this.projectAssignmentService.autoCategorizeSubmittedProject(
                project._id.toString(),
                project.category as ProjectCategory
            );

            return {
                ...project.toObject(),
                categorization,
                message: 'Project created and submitted to government department successfully',
            };
        } catch (assignmentError) {
            console.error('Auto-categorization failed:', assignmentError);
            return {
                ...project.toObject(),
                categorization: null,
                message: 'Project created and submitted, but department assignment failed',
            };
        }
    }

    @Get('my-projects')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Get all my projects (Farmer only)' })
    @ApiResponse({ status: 200, description: 'Returns farmer projects' })
    async getMyProjects(@Req() req: RequestWithUser, @Query('status') status?: string) {
        return this.projectsService.findByFarmer(req.user.userId, status);
    }

    @Patch(':id')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Update project (Farmer only - only submitted status)' })
    @ApiResponse({ status: 200, description: 'Project updated successfully' })
    async update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @Req() req: RequestWithUser,
    ) {
        const project = await this.projectsService.findOne(id);

        if (project.farmer.toString() !== req.user.userId) {
            throw new HttpException('Unauthorized to update this project', HttpStatus.FORBIDDEN);
        }

        // Only allow updates if project is still submitted (not under review or beyond)
        if (project.status !== 'submitted') {
            throw new HttpException(
                'Cannot update project after it has been assigned for review',
                HttpStatus.BAD_REQUEST,
            );
        }

        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Delete project (Farmer only - only submitted status)' })
    @ApiResponse({ status: 200, description: 'Project deleted successfully' })
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
        const project = await this.projectsService.findOne(id);

        if (project.farmer.toString() !== req.user.userId) {
            throw new HttpException('Unauthorized to delete this project', HttpStatus.FORBIDDEN);
        }

        // Only allow deletion if project is still submitted
        if (project.status !== 'submitted') {
            throw new HttpException(
                'Cannot delete project after it has been assigned for review',
                HttpStatus.BAD_REQUEST,
            );
        }

        return this.projectsService.remove(id);
    }

    // ==================== GOVERNMENT OFFICIAL ENDPOINTS ====================

    @Get()
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get all projects (Government Official only)' })
    @ApiResponse({ status: 200, description: 'Returns all projects' })
    async findAll(@Req() req: RequestWithUser) {
        console.log('✅ Government official accessing all projects');
        return this.projectsService.findAllProjects();
    }

    @Get('government/dashboard')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get all projects for government dashboard' })
    @ApiResponse({ status: 200, description: 'Returns all projects for government view' })
    async getAllProjectsForGovernment(@Req() req: RequestWithUser) {
        console.log('✅ Government official accessing dashboard');
        return this.projectsService.getAllProjectsForGovernment();
    }

    @Get('pending/review')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get projects pending review (Government Official only)' })
    @ApiResponse({ status: 200, description: 'Returns projects pending review' })
    async getPendingProjects(@Req() req: RequestWithUser) {
        console.log('✅ Government official accessing pending projects endpoint');
        console.log('User role:', req.user.role);
        return this.projectsService.findPendingProjects();
    }

    @Get('department/:department')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get projects by department (Government Official only)' })
    @ApiResponse({ status: 200, description: 'Returns department projects' })
    async getDepartmentProjects(
        @Param('department') department: GovernmentDepartment,
        @Req() req: RequestWithUser
    ) {
        console.log(`✅ Government official accessing ${department} department projects`);
        return this.projectAssignmentService.getProjectsByDepartment(department, req.user.userId);
    }

    @Get('my-department')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get projects from my department (Government Official only)' })
    @ApiResponse({ status: 200, description: 'Returns my department projects' })
    async getMyDepartmentProjects(@Req() req: RequestWithUser) {
        console.log(`✅ Government official accessing their department projects`);
        
        // Get user's department from user service
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        
        const userDepartment = user.department || GovernmentDepartment.GENERAL;
        
        return this.projectAssignmentService.getProjectsByDepartment(userDepartment, req.user.userId);
    }

    @Get('department-recommendations/:category')
    @Roles(UserRole.GOVERNMENT_OFFICIAL, UserRole.FARMER)
    @ApiOperation({ summary: 'Get department recommendations for project category' })
    @ApiResponse({ status: 200, description: 'Returns department recommendations' })
    async getDepartmentRecommendations(
        @Param('category') category: ProjectCategory,
        @Req() req: RequestWithUser
    ) {
        console.log('✅ Getting department recommendations for category:', category);
        return this.projectAssignmentService.getDepartmentRecommendations(category);
    }

    @Patch(':id/due-diligence')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update due diligence (Any official in project department)' })
    @ApiResponse({ status: 200, description: 'Due diligence updated' })
    async updateDueDiligence(
        @Param('id') id: string,
        @Body() updateDto: UpdateDueDiligenceDto,
        @Req() req: RequestWithUser,
    ) {
        console.log('✅ Government official updating due diligence');
        
        // Check if official is in the same department as project
        const project = await this.projectsService.findOne(id);
        const user = await this.usersService.findById(req.user.userId);
        
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        
        if (project.department && user.department && project.department !== user.department) {
            throw new HttpException(
                'You can only review projects in your department', 
                HttpStatus.FORBIDDEN
            );
        }
        
        return this.projectsService.updateDueDiligence(id, req.user.userId, updateDto);
    }

    @Post(':id/verify')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Verify and approve project (Any official in project department)' })
    @ApiResponse({ status: 200, description: 'Project verified successfully' })
    async verifyProject(
        @Param('id') id: string,
        @Body() verifyDto: VerifyProjectDto,
        @Req() req: RequestWithUser,
    ) {
        console.log('✅ Government official verifying project');
        
        // Check if official is in the same department as project
        const project = await this.projectsService.findOne(id);
        const user = await this.usersService.findById(req.user.userId);
        
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        
        if (project.department && user.department && project.department !== user.department) {
            throw new HttpException(
                'You can only verify projects in your department', 
                HttpStatus.FORBIDDEN
            );
        }
        
        return this.projectsService.verifyProject(id, req.user.userId, verifyDto.notes);
    }
   
    @Post(':id/reject')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Reject project (Any official in project department)' })
    @ApiResponse({ status: 200, description: 'Project rejected' })
    async rejectProject(
        @Param('id') id: string,
        @Body() rejectDto: RejectProjectDto,
        @Req() req: RequestWithUser,
    ) {
        console.log('✅ Government official rejecting project');
        
        // Check if official is in the same department as project
        const project = await this.projectsService.findOne(id);
        const user = await this.usersService.findById(req.user.userId);
        
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        
        if (project.department && user.department && project.department !== user.department) {
            throw new HttpException(
                'You can only reject projects in your department', 
                HttpStatus.FORBIDDEN
            );
        }
        
        return this.projectsService.rejectProject(id, req.user.userId, rejectDto.reason);
    }

    // ==================== CONTRIBUTOR ENDPOINTS ====================

    @Get('verified/list')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get all verified/active projects for funding' })
    @ApiResponse({ status: 200, description: 'Returns verified projects' })
    async getVerifiedProjects(
        @Query('category') category?: string,
        @Query('location') location?: string,
    ) {
        return this.projectsService.findVerifiedProjects(category, location);
    }

    @Post(':id/favorite')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Add project to favorites' })
    @ApiResponse({ status: 200, description: 'Project added to favorites' })
    async addToFavorites(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.projectsService.addToFavorites(req.user.userId, id);
    }

    @Delete(':id/favorite')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Remove project from favorites' })
    @ApiResponse({ status: 200, description: 'Project removed from favorites' })
    async removeFromFavorites(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.projectsService.removeFromFavorites(req.user.userId, id);
    }

    @Get('favorites')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Get my favorite projects' })
    @ApiResponse({ status: 200, description: 'Returns favorite projects' })
    async getFavorites(@Req() req: RequestWithUser) {
        return this.projectsService.getFavorites(req.user.userId);
    }

    @Get(':id/is-favorite')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Check if project is favorited' })
    @ApiResponse({ status: 200, description: 'Returns favorite status' })
    async isFavorite(@Param('id') id: string, @Req() req: RequestWithUser) {
        const isFavorite = await this.projectsService.isFavorite(req.user.userId, id);
        return { isFavorite };
    }

    // ==================== SHARED ENDPOINTS ====================

    @Get('stats/dashboard')
    @ApiOperation({ summary: 'Get platform statistics' })
    @ApiResponse({ status: 200, description: 'Returns platform stats' })
    async getStats() {
        return this.projectsService.getStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiResponse({ status: 200, description: 'Returns project details' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
      const project = await this.projectsService.findOne(id);
    
    
      const farmerIdString = typeof project.farmer === 'string' 
        ? project.farmer 
        : project.farmer._id?.toString() || project.farmer.toString();
    
      if (req.user.role === UserRole.FARMER && farmerIdString !== req.user.userId) {
        throw new HttpException('Unauthorized to view this project', HttpStatus.FORBIDDEN);
      }
    
      return project;
    }

    // ==================== DEBUG ENDPOINT (Temporary) ====================
    
    @Get('debug/user-info')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'DEBUG: Get current user info and role' })
    @ApiResponse({ status: 200, description: 'User info for debugging' })
    async debugUserInfo(@Req() req: RequestWithUser) {
        return {
            userId: req.user.userId,
            role: req.user.role,
            email: req.user.email,
            isGovernmentOfficial: req.user.role === UserRole.GOVERNMENT_OFFICIAL,
            timestamp: new Date().toISOString(),
            message: 'Use this endpoint to verify your role is GOVERNMENT_OFFICIAL'
        };
    }

    @Get(':id/blockchain-status')
    @ApiOperation({ summary: 'Get blockchain status for a project' })
    @ApiResponse({ status: 200, description: 'Returns blockchain status' })
    async getBlockchainStatus(@Param('id') id: string, @Req() req: RequestWithUser) {
      const project = await this.projectsService.findOne(id);
      
      // Authorization check
      if (req.user.role === UserRole.FARMER && project.farmer.toString() !== req.user.userId) {
        throw new HttpException('Unauthorized to view this project', HttpStatus.FORBIDDEN);
      }
    
      return this.projectsService.getBlockchainStatus(id);
    }
    
    @Post(':id/complete-blockchain')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Complete project on blockchain' })
    @ApiResponse({ status: 200, description: 'Project completed on blockchain' })
    async completeProjectOnBlockchain(@Param('id') id: string, @Req() req: RequestWithUser) {
      return this.projectsService.completeProjectOnBlockchain(id, req.user.userId);
    }
}