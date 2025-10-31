import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { ContributionService } from "./contribution.service";

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
  Logger,
} from '@nestjs/common';
import {
  CreateContributionDto,
  ConfirmContributionDto,
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
  private readonly logger = new Logger(ContributionController.name);
  
  constructor(private readonly contributionService: ContributionService) {}

  // ==================== CONTRIBUTOR/INVESTOR ENDPOINTS ====================

  @Post()
  @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR)
  @ApiOperation({ summary: 'Record a contribution to a project (Polygon MATIC)' })
  @ApiResponse({ status: 201, description: 'Contribution recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid contribution data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async createContribution(
    @Body() createContributionDto: CreateContributionDto,
    @Req() req: RequestWithUser,
  ) {
    // Validate that contribution is using MATIC
    if (createContributionDto.currency && createContributionDto.currency !== 'MATIC') {
      throw new HttpException(
        'Only MATIC contributions are supported on Polygon network',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Ensure currency is set to MATIC
    createContributionDto.currency = 'MATIC';

    // Validate blockchain payment method
    if (createContributionDto.paymentMethod !== 'blockchain') {
      throw new HttpException(
        'Only blockchain payment method is supported',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate transaction hash
    if (!createContributionDto.transactionHash) {
      throw new HttpException(
        'Transaction hash is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!createContributionDto.transactionHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new HttpException(
        'Invalid transaction hash format',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`📝 New MATIC contribution:
      - TX Hash: ${createContributionDto.transactionHash}
      - Amount: ${createContributionDto.amount} MATIC
      - Project: ${createContributionDto.projectId}
      - Contributor: ${req.user.userId}
      - Network: Polygon Mainnet
    `);

    return this.contributionService.createContribution(
      req.user.userId,
      createContributionDto,
    );
  }

  @Patch(':id/confirm')
  @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR)
  @ApiOperation({ summary: 'Confirm contribution with blockchain transaction' })
  @ApiResponse({ status: 200, description: 'Contribution confirmed' })
  @ApiResponse({ status: 404, description: 'Contribution not found' })
  async confirmContribution(
    @Param('id') id: string,
    @Body() confirmDto: ConfirmContributionDto,
    @Req() req: RequestWithUser,
  ) {
    this.logger.log(`✅ Confirming contribution ${id} with TX ${confirmDto.transactionHash}`);
    return this.contributionService.confirmContribution(id, confirmDto);
  }

  @Get('my-contributions')
  @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR)
  @ApiOperation({ summary: 'Get my contributions' })
  @ApiResponse({ status: 200, description: 'Returns contributor contributions' })
  async getMyContributions(
    @Req() req: RequestWithUser,
    @Query() query: GetContributionsQueryDto,
  ) {
    return this.contributionService.getMyContributions(req.user.userId, query);
  }

  @Get('my-stats')
  @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR)
  @ApiOperation({ summary: 'Get my contribution statistics' })
  @ApiResponse({ status: 200, description: 'Returns contributor statistics' })
  async getMyStats(@Req() req: RequestWithUser) {
    return this.contributionService.getContributorStats(req.user.userId);
  }

  @Get('stats/platform')
  @Roles(UserRole.GOVERNMENT_OFFICIAL, UserRole.INVESTOR, UserRole.FARMER)
  @ApiOperation({ summary: 'Get platform contribution statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform statistics' })
  async getPlatformStats() {
    return this.contributionService.getPlatformStats();
  }

  // ==================== POLYGON-SPECIFIC ENDPOINTS ====================

  @Get('polygon/verify-transaction/:txHash')
  @Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL)
  @ApiOperation({ summary: 'Verify a Polygon transaction hash' })
  @ApiResponse({ status: 200, description: 'Transaction verification status' })
  async verifyTransaction(@Param('txHash') txHash: string) {
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new HttpException('Invalid transaction hash format', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`🔍 Transaction verification: ${txHash}`);
    this.logger.log(`   Polygonscan: https://polygonscan.com/tx/${txHash}`);

    return {
      transactionHash: txHash,
      network: 'Polygon Mainnet',
      chainId: 137,
      polygonscanLink: `https://polygonscan.com/tx/${txHash}`,
      message: 'Verify transaction on Polygonscan',
    };
  }

  @Get('polygon/network-info')
  @ApiOperation({ summary: 'Get Polygon network information' })
  @ApiResponse({ status: 200, description: 'Network information' })
  async getNetworkInfo() {
    return {
      network: 'Polygon Mainnet',
      chainId: 137,
      chainIdHex: '0x89',
      rpcUrl: 'https://polygon-rpc.com',
      explorerUrl: 'https://polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      note: 'Smart contract automatically releases funds to farmer wallet when goal is reached',
      flow: [
        '1. Investor sends MATIC to smart contract',
        '2. Contract holds funds until goal reached',
        '3. When goal reached, contract auto-releases to farmer wallet',
        '4. No manual withdrawal needed'
      ]
    };
  }

 // ==================== PROJECT CONTRIBUTION ENDPOINTS ====================
// ⚠️ IMPORTANT: More specific routes MUST come before generic ones

@Get('project/:projectId/contribution-info')
@Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR)
@ApiOperation({ summary: 'Get project contribution info for MetaMask transaction' })
@ApiResponse({ status: 200, description: 'Returns blockchain details for contribution' })
async getProjectContributionInfo(@Param('projectId') projectId: string) {
  this.logger.log(`📊 Getting contribution info for project: ${projectId}`);
  const info = await this.contributionService.getProjectForContribution(projectId);
  
  this.logger.log(`✅ Contribution info retrieved:
    - Blockchain Project ID: ${info.blockchainProjectId}
    - Smart Contract: ${info.contractAddress}
    - Farmer Wallet: ${info.farmerWalletAddress}
    - Current: ${info.currentFunding} MATIC
    - Goal: ${info.fundingGoal} MATIC
    - Fully Funded: ${info.isFullyFunded}
    - Can Contribute: ${info.canContribute}
  `);
  
  return info;
}

@Get('project/:projectId/contributions')
@Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL, UserRole.INVESTOR)
@ApiOperation({ summary: 'Get all contributions for a project with contributor details' })
@ApiResponse({ status: 200, description: 'Returns list of contributions' })
async getProjectContributions(@Param('projectId') projectId: string) {
  this.logger.log(`👥 Getting contributions list for project: ${projectId}`);
  const result = await this.contributionService.getProjectContributions(projectId);
  
  this.logger.log(`✅ Found ${result.contributions.length} contributions, ${result.contributorCount} unique contributors`);
  
  return result;
}


@Get('project/:projectId/contribution-count')
@Roles(UserRole.CONTRIBUTOR, UserRole.INVESTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL)
@ApiOperation({ summary: 'Get contribution count for a project' })
@ApiResponse({ status: 200, description: 'Returns contribution count' })
async getContributionCount(@Param('projectId') projectId: string) {
  this.logger.log(`🔢 Getting contribution count for project: ${projectId}`);
  return this.contributionService.getContributionCount(projectId);
}


@Get(':id')
@Roles(UserRole.CONTRIBUTOR, UserRole.FARMER, UserRole.GOVERNMENT_OFFICIAL, UserRole.INVESTOR)
@ApiOperation({ summary: 'Get contribution details by ID' })
@ApiResponse({ status: 200, description: 'Returns contribution details' })
@ApiResponse({ status: 404, description: 'Contribution not found' })
async getContribution(@Param('id') id: string, @Req() req: RequestWithUser) {
  const contribution = await this.contributionService.getContributionById(id);

  // Authorization check
  if (
    (req.user.role === UserRole.CONTRIBUTOR || req.user.role === UserRole.INVESTOR) &&
    contribution.contributor.toString() !== req.user.userId
  ) {
    throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
  }

  return contribution;
}



}
