import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    HttpStatus,
    HttpException,
    Query,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { ProjectsService } from './projects.service';
  import { CreateProjectDto } from './dto/create-project.dto';
  import { UpdateProjectDto } from './dto/update-project.dto';
  import { AssignDueDiligenceDto } from './dto/assign-due-diligence.dto';
  import { UpdateDueDiligenceDto } from './dto/update-due-diligence.dto';
  import { VerifyProjectDto } from './dto/verify-project.dto';
  import { RejectProjectDto } from './dto/reject-project.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../common/enums/user-role.enum';
  
  interface RequestWithUser extends Request {
    user: {
      userId: string;
      role: UserRole;
      email: string;
    };
  }
  
  @ApiTags('projects')
  @Controller('projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}
  
    // ==================== FARMER ENDPOINTS ====================
  
    @Post()
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Create a new project (Farmer only)' })
    @ApiResponse({ status: 201, description: 'Project created successfully' })
    async create(@Body() createProjectDto: CreateProjectDto, @Req() req: RequestWithUser) {
      return this.projectsService.create(createProjectDto, req.user.userId);
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
    @ApiOperation({ summary: 'Update project (Farmer only - only draft/submitted status)' })
    @ApiResponse({ status: 200, description: 'Project updated successfully' })
    async update(
      @Param('id') id: string,
      @Body() updateProjectDto: UpdateProjectDto,
      @Req() req: RequestWithUser,
    ) {
      const project = await this.projectsService.findOne(id);
      
      // Verify ownership
      if (project.farmer.toString() !== req.user.userId) {
        throw new HttpException('Unauthorized to update this project', HttpStatus.FORBIDDEN);
      }
  
      // Only allow updates if project is in draft or submitted status
      if (!['draft', 'submitted'].includes(project.status)) {
        throw new HttpException(
          'Cannot update project after it has been reviewed',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      return this.projectsService.update(id, updateProjectDto);
    }
  
    @Delete(':id')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Delete project (Farmer only - only draft status)' })
    @ApiResponse({ status: 200, description: 'Project deleted successfully' })
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
      const project = await this.projectsService.findOne(id);
      
      // Verify ownership
      if (project.farmer.toString() !== req.user.userId) {
        throw new HttpException('Unauthorized to delete this project', HttpStatus.FORBIDDEN);
      }
  
      // Only allow deletion if project is in draft status
      if (project.status !== 'draft') {
        throw new HttpException(
          'Cannot delete project after submission',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      return this.projectsService.remove(id);
    }
  
    @Post(':id/submit')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Submit project for review (Farmer only)' })
    @ApiResponse({ status: 200, description: 'Project submitted for review' })
    async submitProject(@Param('id') id: string, @Req() req: RequestWithUser) {
      const project = await this.projectsService.findOne(id);
      
      // Verify ownership
      if (project.farmer.toString() !== req.user.userId) {
        throw new HttpException('Unauthorized to submit this project', HttpStatus.FORBIDDEN);
      }
  
      // Only draft projects can be submitted
      if (project.status !== 'draft') {
        throw new HttpException('Project is already submitted', HttpStatus.BAD_REQUEST);
      }
  
      return this.projectsService.submitForReview(id);
    }
  
    // ==================== GOVERNMENT ENDPOINTS ====================
  
    @Get('pending/review')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Get projects pending review (Government only)' })
    @ApiResponse({ status: 200, description: 'Returns projects pending review' })
    async getPendingProjects() {
      return this.projectsService.findPendingProjects();
    }
  
    @Get('my-assigned')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Get my assigned projects (Government only)' })
    @ApiResponse({ status: 200, description: 'Returns assigned projects' })
    async getMyAssignedProjects(@Req() req: RequestWithUser) {
      return this.projectsService.getMyAssignedProjects(req.user.userId);
    }
  
    @Post(':id/assign')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Assign project for due diligence (Government only)' })
    @ApiResponse({ status: 200, description: 'Project assigned successfully' })
    async assignDueDiligence(
      @Param('id') id: string,
      @Body() assignDto: AssignDueDiligenceDto,
    ) {
      return this.projectsService.assignDueDiligence(id, assignDto.governmentOfficialId);
    }
  
    @Patch(':id/due-diligence')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Update due diligence (Government only)' })
    @ApiResponse({ status: 200, description: 'Due diligence updated' })
    async updateDueDiligence(
      @Param('id') id: string,
      @Body() updateDto: UpdateDueDiligenceDto,
      @Req() req: RequestWithUser,
    ) {
      return this.projectsService.updateDueDiligence(id, req.user.userId, updateDto);
    }
  
    @Post(':id/verify')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Verify and approve project (Government only)' })
    @ApiResponse({ status: 200, description: 'Project verified successfully' })
    async verifyProject(
      @Param('id') id: string,
      @Body() verifyDto: VerifyProjectDto,
      @Req() req: RequestWithUser,
    ) {
      return this.projectsService.verifyProject(id, req.user.userId, verifyDto.notes);
    }
  
    @Post(':id/reject')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Reject project (Government only)' })
    @ApiResponse({ status: 200, description: 'Project rejected' })
    async rejectProject(
      @Param('id') id: string,
      @Body() rejectDto: RejectProjectDto,
      @Req() req: RequestWithUser,
    ) {
      return this.projectsService.rejectProject(id, req.user.userId, rejectDto.reason);
    }
  
    // ==================== CONTRIBUTOR ENDPOINTS ====================
  
    @Get('verified/list')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT)
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
      
      // Check if user has permission to view
      if (req.user.role === UserRole.FARMER && project.farmer.toString() !== req.user.userId) {
        throw new HttpException('Unauthorized to view this project', HttpStatus.FORBIDDEN);
      }
      
      return project;
    }
  }