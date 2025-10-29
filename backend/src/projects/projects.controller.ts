import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GovernmentDepartment } from "src/common/enums/government-department.enum";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { UsersService } from "../users/users.service";
import { ProjectCategory } from "./dto/create-project.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { RejectProjectDto } from "./dto/reject-project.dto";
import { UpdateDueDiligenceDto } from "./dto/update-due-diligence.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { VerifyProjectDto } from "./dto/verify-project.dto";
import { ProjectAssignmentService } from "./project-assignment.service";
import { ProjectResponseTransformer } from "./project-response-transformer.service";
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
        private readonly responseTransformer: ProjectResponseTransformer,
    ) {}

    // ==================== FARMER ENDPOINTS ====================

    @Post()
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Create project with MATIC funding goal (Farmer only)' })
    @ApiResponse({ 
        status: 201, 
        description: 'Project created successfully. All amounts are in MATIC currency.',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                title: 'Organic Tomato Farm',
                fundingGoal: 100,
                fundingGoalMatic: 100,
                fundingGoalFormatted: '100 MATIC',
                currentFunding: 0,
                currentFundingMatic: 0,
                currentFundingFormatted: '0 MATIC',
                currency: 'MATIC',
                status: 'submitted',
                farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                message: 'Project created. Submit MATIC amount only (not USD).'
            }
        }
    })
    async create(@Body() createProjectDto: CreateProjectDto, @Req() req: RequestWithUser) {
        console.log('=== PROJECT CREATION DEBUG ===');
        console.log('Funding Goal (MATIC):', createProjectDto.fundingGoal);
        console.log('Farmer Wallet:', createProjectDto.farmerWalletAddress);

        if (!req.user || !req.user.userId) {
            throw new HttpException(
                'Authentication failed: missing user information',
                HttpStatus.UNAUTHORIZED
            );
        }

        // Create project
        const project = await this.projectsService.create(createProjectDto, req.user.userId);
        
        // Auto-categorize by department
        try {
            const categorization = await this.projectAssignmentService.autoCategorizeSubmittedProject(
                project._id.toString(),
                project.category as ProjectCategory
            );

            // ✅ Transform response to ensure MATIC-only
            const transformedProject = this.responseTransformer.transformProject(project);

            return {
                ...transformedProject,
                categorization,
                message: '✅ Project created with MATIC funding goal (not USD). All amounts are in MATIC cryptocurrency.',
            };
        } catch (assignmentError) {
            console.error('Auto-categorization failed:', assignmentError);
            const transformedProject = this.responseTransformer.transformProject(project);
            
            return {
                ...transformedProject,
                categorization: null,
                message: '✅ Project created with MATIC funding goal. Department assignment pending.',
            };
        }
    }

    @Get('my-projects')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Get all my projects with MATIC amounts (Farmer only)' })
    @ApiResponse({ status: 200, description: 'Returns farmer projects with MATIC currency' })
    async getMyProjects(@Req() req: RequestWithUser, @Query('status') status?: string) {
        console.log('=== GET MY PROJECTS DEBUG ===');
        console.log('Farmer ID:', req.user.userId);
        console.log('Status filter:', status);
        
        const projects = await this.projectsService.findByFarmer(req.user.userId, status);
        
        console.log('✅ Found projects:', projects.length);
        
        // ✅ Transform to ensure MATIC-only response
        return this.responseTransformer.transformProjects(projects);
    }

    @Patch(':id')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Update project (amounts in MATIC)' })
    @ApiResponse({ status: 200, description: 'Project updated with MATIC amounts' })
    async update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @Req() req: RequestWithUser,
    ) {
        const project = await this.projectsService.findOne(id);

        // FIXED: Better farmer ID comparison
        const farmerIdString = typeof project.farmer === 'string' 
            ? project.farmer 
            : (project.farmer as any)._id?.toString() || project.farmer.toString();

        if (farmerIdString !== req.user.userId) {
            throw new HttpException('Unauthorized to update this project', HttpStatus.FORBIDDEN);
        }

        if (project.status !== 'submitted') {
            throw new HttpException(
                'Cannot update project after it has been assigned for review',
                HttpStatus.BAD_REQUEST,
            );
        }

        const updatedProject = await this.projectsService.update(id, updateProjectDto);
        
        // ✅ Transform response
        return this.responseTransformer.transformProject(updatedProject);
    }

    @Delete(':id')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Delete project (Farmer only)' })
    @ApiResponse({ status: 200, description: 'Project deleted successfully' })
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
        const project = await this.projectsService.findOne(id);

        // FIXED: Better farmer ID comparison
        const farmerIdString = typeof project.farmer === 'string' 
            ? project.farmer 
            : (project.farmer as any)._id?.toString() || project.farmer.toString();

        if (farmerIdString !== req.user.userId) {
            throw new HttpException('Unauthorized to delete this project', HttpStatus.FORBIDDEN);
        }

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
    @ApiOperation({ summary: 'Get all projects (amounts in MATIC)' })
    @ApiResponse({ status: 200, description: 'Returns all projects with MATIC currency' })
    async findAll(@Req() req: RequestWithUser) {
        const projects = await this.projectsService.findAllProjects();
        
        // ✅ Transform all projects
        return this.responseTransformer.transformProjects(projects);
    }

    @Get('government/dashboard')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get government dashboard with MATIC stats' })
    @ApiResponse({ status: 200, description: 'Returns projects with MATIC amounts' })
    async getAllProjectsForGovernment(@Req() req: RequestWithUser) {
        const projects = await this.projectsService.getAllProjectsForGovernment();
        
        // ✅ Transform response
        return this.responseTransformer.transformProjects(projects);
    }

    @Get('pending/review')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get pending projects (MATIC amounts)' })
    @ApiResponse({ status: 200, description: 'Returns pending projects with MATIC' })
    async getPendingProjects(@Req() req: RequestWithUser) {
        const projects = await this.projectsService.findPendingProjects();
        
        // ✅ Transform response
        return this.responseTransformer.transformProjects(projects);
    }

    @Get('department/:department')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get department projects (MATIC)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns department projects with MATIC amounts',
        schema: {
            example: {
                department: 'CROPS',
                totalProjects: 15,
                projects: [
                    {
                        _id: '507f1f77bcf86cd799439011',
                        title: 'Organic Farm',
                        fundingGoal: 100,
                        fundingGoalMatic: 100,
                        currency: 'MATIC'
                    }
                ],
                message: 'Found 15 projects in CROPS department'
            }
        }
    })
    async getDepartmentProjects(
        @Param('department') department: GovernmentDepartment,
        @Req() req: RequestWithUser
    ) {
        // ✅ FIX: Get the full response object
        const departmentResponse = await this.projectAssignmentService.getProjectsByDepartment(department, req.user.userId);
        
        // ✅ Transform only the projects array
        const transformedProjects = this.responseTransformer.transformProjects(departmentResponse.projects);
        
        // ✅ Return the full response with transformed projects
        return {
            department: departmentResponse.department,
            totalProjects: departmentResponse.totalProjects,
            projects: transformedProjects,
            message: departmentResponse.message
        };
    }

    @Get('my-department')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get my department projects (MATIC)' })
    @ApiResponse({ status: 200, description: 'Returns my department projects with MATIC' })
    async getMyDepartmentProjects(@Req() req: RequestWithUser) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        
        const userDepartment = user.department || GovernmentDepartment.GENERAL;
        
        // ✅ FIX: Get the full response object
        const departmentResponse = await this.projectAssignmentService.getProjectsByDepartment(userDepartment, req.user.userId);
        
        // ✅ Transform only the projects array
        const transformedProjects = this.responseTransformer.transformProjects(departmentResponse.projects);
        
        // ✅ Return the full response with transformed projects
        return {
            department: departmentResponse.department,
            totalProjects: departmentResponse.totalProjects,
            projects: transformedProjects,
            message: departmentResponse.message
        };
    }

    @Get('department-recommendations/:category')
    @Roles(UserRole.GOVERNMENT_OFFICIAL, UserRole.FARMER)
    @ApiOperation({ summary: 'Get department recommendations' })
    @ApiResponse({ status: 200, description: 'Returns department recommendations' })
    async getDepartmentRecommendations(
        @Param('category') category: ProjectCategory,
        @Req() req: RequestWithUser
    ) {
        return this.projectAssignmentService.getDepartmentRecommendations(category);
    }

    @Patch(':id/due-diligence')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update due diligence' })
    @ApiResponse({ status: 200, description: 'Due diligence updated' })
    async updateDueDiligence(
        @Param('id') id: string,
        @Body() updateDto: UpdateDueDiligenceDto,
        @Req() req: RequestWithUser,
    ) {
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
        
        const updatedProject = await this.projectsService.updateDueDiligence(id, req.user.userId, updateDto);
        
        // ✅ Transform response
        return this.responseTransformer.transformProject(updatedProject);
    }

    @Post(':id/verify')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Verify project (makes it active for MATIC funding)' })
    @ApiResponse({ status: 200, description: 'Project verified - now accepts MATIC contributions' })
    async verifyProject(
        @Param('id') id: string,
        @Body() verifyDto: VerifyProjectDto,
        @Req() req: RequestWithUser,
    ) {
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
        
        const verifiedProject = await this.projectsService.verifyProject(id, req.user.userId, verifyDto.notes);
        
        // ✅ Transform response
        const transformed = this.responseTransformer.transformProject(verifiedProject);
        
        return {
            ...transformed,
            message: '✅ Project verified and activated! Now accepts MATIC contributions on Polygon blockchain.'
        };
    }
   
    @Post(':id/reject')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Reject project' })
    @ApiResponse({ status: 200, description: 'Project rejected' })
    async rejectProject(
        @Param('id') id: string,
        @Body() rejectDto: RejectProjectDto,
        @Req() req: RequestWithUser,
    ) {
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
        
        const rejectedProject = await this.projectsService.rejectProject(id, req.user.userId, rejectDto.reason);
        
        // ✅ Transform response
        return this.responseTransformer.transformProject(rejectedProject);
    }

    // ==================== CONTRIBUTOR ENDPOINTS ====================

    @Get('verified/list')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL, UserRole.INVESTOR)
    @ApiOperation({ summary: 'Get verified projects accepting MATIC' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns active projects that accept MATIC contributions',
        schema: {
            example: [{
                _id: '507f1f77bcf86cd799439011',
                title: 'Organic Farm',
                fundingGoal: 100,
                fundingGoalMatic: 100,
                currentFunding: 25,
                currentFundingMatic: 25,
                currency: 'MATIC',
                fundingProgress: '25.00',
                status: 'active',
                message: 'Contribute using MATIC cryptocurrency only'
            }]
        }
    })
    async getVerifiedProjects(
        @Query('category') category?: string,
        @Query('location') location?: string,
    ) {
        const projects = await this.projectsService.findVerifiedProjects(category, location);
        
        // ✅ Transform response
        return this.responseTransformer.transformProjects(projects);
    }

    @Post(':id/favorite')
    @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Add project to favorites' })
    @ApiResponse({ status: 200, description: 'Project added to favorites' })
    async addToFavorites(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.projectsService.addToFavorites(req.user.userId, id);
    }

    @Delete(':id/favorite')
    @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Remove project from favorites' })
    @ApiResponse({ status: 200, description: 'Project removed from favorites' })
    async removeFromFavorites(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.projectsService.removeFromFavorites(req.user.userId, id);
    }

    @Get('favorites')
    @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Get favorite projects (MATIC amounts)' })
    @ApiResponse({ status: 200, description: 'Returns favorite projects' })
    async getFavorites(@Req() req: RequestWithUser) {
        const projects = await this.projectsService.getFavorites(req.user.userId);
        
        // ✅ Transform response
        return this.responseTransformer.transformProjects(projects);
    }

    @Get(':id/is-favorite')
    @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR, UserRole.FARMER)
    @ApiOperation({ summary: 'Check if project is favorited' })
    @ApiResponse({ status: 200, description: 'Returns favorite status' })
    async isFavorite(@Param('id') id: string, @Req() req: RequestWithUser) {
        const isFavorite = await this.projectsService.isFavorite(req.user.userId, id);
        return { isFavorite };
    }

    // ==================== SHARED ENDPOINTS ====================

    @Get('stats/dashboard')
    @ApiOperation({ summary: 'Get platform statistics (MATIC)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns platform stats with MATIC amounts',
        schema: {
            example: {
                totalProjects: 150,
                totalFunding: 50000,
                totalFundingMatic: 50000,
                totalFundingFormatted: '50000 MATIC',
                currency: 'MATIC',
                message: 'All amounts are in MATIC cryptocurrency'
            }
        }
    })
    async getStats() {
        const stats = await this.projectsService.getStats();
        
        // ✅ Transform stats
        return this.responseTransformer.transformStats(stats);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project details (MATIC amounts)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns project with MATIC currency',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                title: 'Organic Farm',
                fundingGoal: 100,
                fundingGoalMatic: 100,
                fundingGoalFormatted: '100 MATIC',
                currentFunding: 25,
                currentFundingMatic: 25,
                currentFundingFormatted: '25 MATIC',
                remainingFunding: 75,
                remainingFundingFormatted: '75 MATIC',
                currency: 'MATIC',
                fundingProgress: '25.00',
                farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                blockchainInfo: {
                    projectId: 0,
                    contractCurrency: 'MATIC',
                    network: 'Polygon Mainnet',
                    chainId: 137
                }
            }
        }
    })
    async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
        const project = await this.projectsService.findOne(id);
      
        // FIXED: Better farmer ID comparison
        const farmerIdString = typeof project.farmer === 'string' 
            ? project.farmer 
            : (project.farmer as any)._id?.toString() || project.farmer.toString();
      
        if (req.user.role === UserRole.FARMER && farmerIdString !== req.user.userId) {
            throw new HttpException('Unauthorized to view this project', HttpStatus.FORBIDDEN);
        }
      
        // ✅ Transform response
        return this.responseTransformer.transformProject(project);
    }

    @Get(':id/blockchain-status')
    @ApiOperation({ summary: 'Get blockchain status (MATIC funding)' })
    @ApiResponse({ status: 200, description: 'Returns blockchain funding status in MATIC' })
    async getBlockchainStatus(@Param('id') id: string, @Req() req: RequestWithUser) {
        const project = await this.projectsService.findOne(id);
        
        // FIXED: Better farmer ID comparison
        const farmerIdString = typeof project.farmer === 'string' 
            ? project.farmer 
            : (project.farmer as any)._id?.toString() || project.farmer.toString();
        
        if (req.user.role === UserRole.FARMER && farmerIdString !== req.user.userId) {
            throw new HttpException('Unauthorized to view this project', HttpStatus.FORBIDDEN);
        }
      
        const blockchainStatus = await this.projectsService.getBlockchainStatus(id);
        
        // ✅ Ensure MATIC currency in blockchain status
        return {
            ...blockchainStatus,
            currency: 'MATIC',
            network: 'Polygon Mainnet',
            chainId: 137,
            message: 'All funding amounts are in MATIC cryptocurrency'
        };
    }
}