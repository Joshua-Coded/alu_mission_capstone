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
  
    // ==================== GOVERNMENT ENDPOINTS ====================
  
    @Get('pending/review')
    @Roles(UserRole.GOVERNMENT)
    @ApiOperation({ summary: 'Get projects pending review (Government only)' })
    @ApiResponse({ status: 200, description: 'Returns projects pending review' })
    async getPendingProjects() {
      return this.projectsService.findPendingProjects();
    }
  
    // ==================== ADMIN/STATS ENDPOINTS ====================
  
    @Get('stats/dashboard')
    @ApiOperation({ summary: 'Get platform statistics' })
    @ApiResponse({ status: 200, description: 'Returns platform stats' })
    async getStats() {
      return this.projectsService.getStats();
    }
  }