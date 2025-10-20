import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpException,
    HttpStatus,
    Patch,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../common/enums/user-role.enum';
  import { ContributionService } from './contribution.service';
  import {
    CreateContributionDto,
    ConfirmContributionDto,
    CreateWithdrawalDto,
    ProcessWithdrawalDto,
    GetContributionsQueryDto,
  } from './dto/contribution.dto';
  
  interface RequestWithUser extends Request {
    user: {
      userId: string;
      role: UserRole;
      email: string;
    };
  }
  
  @ApiTags('contributions')
  @Controller('contributions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  export class ContributionController {
    constructor(private readonly contributionService: ContributionService) {}
  
    // ==================== CONTRIBUTOR ENDPOINTS ====================
  
    @Post()
    @Roles(UserRole.CONTRIBUTOR)
    @ApiOperation({ summary: 'Record a contribution to a project' })
    @ApiResponse({ status: 201, description: 'Contribution recorded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid contribution data' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async createContribution(
      @Body() createContributionDto: CreateContributionDto,
      @Req() req: RequestWithUser,
    ) {
      return this.contributionService.createContribution(
        req.user.userId,
        createContributionDto,
      );
    }
  
    @Patch(':id/confirm')
    @Roles(UserRole.CONTRIBUTOR)
    @ApiOperation({ summary: 'Confirm contribution with blockchain transaction' })
    @ApiResponse({ status: 200, description: 'Contribution confirmed' })
    @ApiResponse({ status: 404, description: 'Contribution not found' })
    async confirmContribution(
      @Param('id') id: string,
      @Body() confirmDto: ConfirmContributionDto,
      @Req() req: RequestWithUser,
    ) {
      return this.contributionService.confirmContribution(id, confirmDto);
    }
  
    @Get('my-contributions')
    @Roles(UserRole.CONTRIBUTOR)
    @ApiOperation({ summary: 'Get my contributions' })
    @ApiResponse({ status: 200, description: 'Returns contributor contributions' })
    async getMyContributions(
      @Req() req: RequestWithUser,
      @Query() query: GetContributionsQueryDto,
    ) {
      return this.contributionService.getMyContributions(req.user.userId, query);
    }
  
    @Get('my-stats')
    @Roles(UserRole.CONTRIBUTOR)
    @ApiOperation({ summary: 'Get my contribution statistics' })
    @ApiResponse({ status: 200, description: 'Returns contributor statistics' })
    async getMyStats(@Req() req: RequestWithUser) {
      return this.contributionService.getContributorStats(req.user.userId);
    }
  
    @Get(':id')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get contribution details' })
    @ApiResponse({ status: 200, description: 'Returns contribution details' })
    @ApiResponse({ status: 404, description: 'Contribution not found' })
    async getContribution(@Param('id') id: string, @Req() req: RequestWithUser) {
      const contribution = await this.contributionService.getContributionById(id);
  
      // Authorization check
      if (
        req.user.role === UserRole.CONTRIBUTOR &&
        contribution.contributor.toString() !== req.user.userId
      ) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      }
  
      return contribution;
    }
  
    @Get('project/:projectId')
    @Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get contributions for a specific project' })
    @ApiResponse({ status: 200, description: 'Returns project contributions' })
    async getProjectContributions(@Param('projectId') projectId: string) {
      return this.contributionService.getProjectContributions(projectId);
    }
  
    // ==================== WITHDRAWAL ENDPOINTS (FARMER) ====================
  
    @Post('withdraw')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Request withdrawal to Rwandan Francs (Farmer only)' })
    @ApiResponse({ status: 201, description: 'Withdrawal request created' })
    @ApiResponse({ status: 400, description: 'Project not completed or invalid request' })
    async requestWithdrawal(
      @Body() createWithdrawalDto: CreateWithdrawalDto,
      @Req() req: RequestWithUser,
    ) {
      return this.contributionService.requestWithdrawal(
        req.user.userId,
        createWithdrawalDto,
      );
    }
  
    @Get('withdrawals/my-withdrawals')
    @Roles(UserRole.FARMER)
    @ApiOperation({ summary: 'Get my withdrawal requests' })
    @ApiResponse({ status: 200, description: 'Returns farmer withdrawals' })
    async getMyWithdrawals(@Req() req: RequestWithUser) {
      return this.contributionService.getFarmerWithdrawals(req.user.userId);
    }
  
    // ==================== WITHDRAWAL ENDPOINTS (GOVERNMENT) ====================
  
    @Get('withdrawals/pending')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get pending withdrawal requests (Government only)' })
    @ApiResponse({ status: 200, description: 'Returns pending withdrawals' })
    async getPendingWithdrawals(@Req() req: RequestWithUser) {
      return this.contributionService.getPendingWithdrawals();
    }
  
    @Patch('withdrawals/:id/process')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Process a withdrawal request (Government only)' })
    @ApiResponse({ status: 200, description: 'Withdrawal processed successfully' })
    @ApiResponse({ status: 404, description: 'Withdrawal not found' })
    async processWithdrawal(
      @Param('id') id: string,
      @Body() processDto: ProcessWithdrawalDto,
      @Req() req: RequestWithUser,
    ) {
      return this.contributionService.processWithdrawal(
        id,
        req.user.userId,
        processDto,
      );
    }
  
    // ==================== UTILITY ENDPOINTS ====================
  
    @Get('utils/eth-to-rwf')
    @ApiOperation({ summary: 'Convert ETH amount to RWF' })
    @ApiResponse({ status: 200, description: 'Returns conversion' })
    async convertEthToRwf(@Query('amount') amount: number) {
      if (!amount || amount <= 0) {
        throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
      }
      return this.contributionService.convertEthToRwf(amount);
    }
  
    @Get('stats/platform')
    @Roles(UserRole.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get platform contribution statistics (Government only)' })
    @ApiResponse({ status: 200, description: 'Returns platform statistics' })
    async getPlatformStats() {
      return this.contributionService.getPlatformStats();
    }
  }