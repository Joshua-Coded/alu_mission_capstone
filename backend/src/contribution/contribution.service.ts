import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { parseEther } from "ethers";
import { Model } from "mongoose";
import { BlockchainService } from "../blockchain/blockchain.service";
import { ProjectsService } from "../projects/projects.service";
import { Project, ProjectDocument } from "../projects/schemas/project.schema";
import { ConfirmContributionDto, CreateContributionDto, GetContributionsQueryDto } from "./dto/contribution.dto";
import { Contribution, ContributionDocument, ContributionStatus } from "./schemas/contribution.schema";

@Injectable()
export class ContributionService {
  private readonly logger = new Logger(ContributionService.name);

  constructor(
    @InjectModel(Contribution.name) private contributionModel: Model<ContributionDocument>,
    private blockchainService: BlockchainService,
    private projectsService: ProjectsService,
  ) {}

  async getProjectForContribution(projectId: string): Promise<{
    project: any;
    blockchainProjectId: number;
    farmerWalletAddress: string;
    contractAddress: string;
    currentFunding: string;
    fundingGoal: string;
    isFullyFunded: boolean;
    isActive: boolean;
    fundingDeadline: string;
    canContribute: boolean; 
    blockingReason?: string; 
    instructions: {
      step1: string;
      step2: string;
      step3: string;
      step4: string;
    };
    blockchainAvailable: boolean;
    blockchainError?: string;
    contributorCount?: number; // ✅ ADDED: Contributor count from database
    totalContributions?: number; 
  }> {
    try {
      const project = await this.projectsService.findOne(projectId);
      
      if (!project) {
        throw new NotFoundException('Project not found');
      }
  
      this.logger.log(`🔍 Project Check:
        - Database ID: ${project._id}
        - Status: ${project.status}
        - Blockchain Project ID: ${project.blockchainProjectId}
        - Blockchain Status: ${project.blockchainStatus}
      `);
  
      if (!project.farmerWalletAddress) {
        throw new BadRequestException('Farmer wallet address not found');
      }
  
      if (project.blockchainProjectId === null || project.blockchainProjectId === undefined) {
        throw new BadRequestException('Project not deployed to blockchain');
      }
  
      let blockchainInfo;
      let blockchainAvailable = true;
      let blockchainError: string | undefined;
  
      // ✅ GET DATABASE CONTRIBUTION DATA (always available)
      const dbContributions = await this.contributionModel
        .find({ 
          project: projectId, 
          status: ContributionStatus.CONFIRMED 
        })
        .exec();
  
      const totalDbContributions = dbContributions.length;
      const uniqueDbContributors = new Set(dbContributions.map(c => c.contributor.toString()));
      const totalDbFunding = dbContributions.reduce((sum, c) => sum + (c.amountMatic || 0), 0);
  
      try {
        blockchainInfo = await this.blockchainService.getProjectInfo(
          project.blockchainProjectId
        );
  
        this.logger.log(`📊 Blockchain Info Retrieved:
          - Project ID: ${project.blockchainProjectId}
          - Total Funding: ${blockchainInfo.totalFunding}
          - Funding Goal: ${blockchainInfo.fundingGoal}
        `);
      } catch (blockchainError) {
        blockchainAvailable = false;
        
        if (blockchainError.message?.includes('rate limit') || 
            blockchainError.message?.includes('Too many requests')) {
          blockchainError = 'Blockchain data temporarily unavailable due to rate limits. Using database information.';
          this.logger.warn(`⚠️ Blockchain rate limit hit for project ${projectId}`);
        } else {
          blockchainError = 'Blockchain data currently unavailable. Using database information.';
          this.logger.error(`❌ Blockchain error for project ${projectId}:`, blockchainError);
        }
  
        // ✅ CREATE FALLBACK using database data
        blockchainInfo = {
          owner: project.farmerWalletAddress,
          isActive: project.status === 'active',
          isCompleted: totalDbFunding >= project.fundingGoal, // Use database funding
          fundsReleased: false,
          totalFunding: (totalDbFunding * 1e18).toString(), // Convert MATIC to wei
          fundingGoal: project.fundingGoal ? (project.fundingGoal * 1e18).toString() : '0',
          fundingDeadline: '0'
        };
      }
  
      // ✅ Calculate if can contribute
      let canContribute = true;
      let blockingReason: string | undefined;
  
      if (project.status !== 'active') {
        canContribute = false;
        blockingReason = `Project status is "${project.status}". Only active projects accept contributions.`;
      } else if (!blockchainAvailable) {
        // Still allow contributions if blockchain is down but project is active
        canContribute = true;
        blockingReason = '⚠️ Blockchain temporarily unavailable. Contributions may take longer to process.';
      } else if (!blockchainInfo.isActive) {
        canContribute = false;
        blockingReason = 'Project is not active on blockchain.';
      } else if (blockchainInfo.isCompleted) {
        canContribute = false;
        blockingReason = '🎉 Project is fully funded!';
      } else if (blockchainInfo.fundsReleased) {
        canContribute = false;
        blockingReason = 'Funds already released to farmer.';
      }
  
      const currentFunding = this.formatEther(blockchainInfo.totalFunding.toString());
      const fundingGoal = this.formatEther(blockchainInfo.fundingGoal.toString());
      const deadline = Number(blockchainInfo.fundingDeadline);
  
      return {
        project: project.toObject(),
        blockchainProjectId: project.blockchainProjectId,
        farmerWalletAddress: project.farmerWalletAddress,
        contractAddress: this.blockchainService.getContractAddress(),
        currentFunding,
        fundingGoal,
        isFullyFunded: blockchainInfo.isCompleted,
        isActive: blockchainInfo.isActive,
        fundingDeadline: new Date(deadline * 1000).toISOString(),
        canContribute,
        blockingReason,
        blockchainAvailable,
        blockchainError,
        // ✅ ADDED: Database contribution data
        contributorCount: uniqueDbContributors.size,
        totalContributions: totalDbContributions,
        instructions: {
          step1: 'Connect MetaMask to Polygon Mainnet',
          step2: `User calls contribute(${project.blockchainProjectId}) with MATIC from their wallet`,
          step3: 'Smart contract holds funds in escrow until goal reached',
          step4: `Contract auto-releases to farmer: ${project.farmerWalletAddress}`
        }
      };
    } catch (error) {
      this.logger.error('❌ Get project for contribution failed:', error);
      throw error;
    }
  }

  private formatEther(wei: string): string {
    try {
      const ether = BigInt(wei) / BigInt(10 ** 18);
      const remainder = BigInt(wei) % BigInt(10 ** 18);
      const decimalPart = remainder.toString().padStart(18, '0').slice(0, 4);
      return `${ether}.${decimalPart}`;
    } catch (error) {
      return '0.0000';
    }
  }

  /**
   * ✅ FIXED: Uses NEW schema fields (amountMatic, amountWei, ContributionStatus enum)
   */
  async createContribution(
    contributorId: string,
    createContributionDto: CreateContributionDto,
  ): Promise<ContributionDocument> {
    try {
      const project = await this.projectsService.findOne(createContributionDto.projectId);
      
      if (!project || project.status !== 'active') {
        throw new BadRequestException('Project not available for funding');
      }
  
      if (project.blockchainProjectId === null || project.blockchainProjectId === undefined) {
        throw new BadRequestException('Project not deployed to blockchain');
      }
  
      const blockchainInfo = await this.blockchainService.getProjectInfo(
        project.blockchainProjectId
      );
  
      if (!blockchainInfo.isActive) {
        throw new BadRequestException('Project not active on blockchain');
      }
  
      this.logger.log(`📝 Recording contribution (transaction already sent by user):
        - Transaction Hash: ${createContributionDto.transactionHash}
        - Amount: ${createContributionDto.amount} MATIC
        - Project: ${project.title}
        - Contributor: ${contributorId}
        - Contributor Wallet: ${createContributionDto.contributorWallet}
        - Blockchain Project ID: ${project.blockchainProjectId}
      `);
  
      const amountWei = parseEther(createContributionDto.amount.toString());
  
      // ✅ FIXED: Include all required schema fields
      const contribution = new this.contributionModel({
        // ✅ REQUIRED FIELDS for schema validation
        amount: createContributionDto.amount,
        contributorWallet: createContributionDto.contributorWallet,
        
        // ✅ NEW schema fields
        contributor: contributorId,
        project: createContributionDto.projectId,
        blockchainProjectId: project.blockchainProjectId,
        farmerWalletAddress: project.farmerWalletAddress,
        amountMatic: createContributionDto.amount,
        amountWei: amountWei.toString(),
        transactionHash: createContributionDto.transactionHash,
        status: ContributionStatus.CONFIRMED,
        transactionType: 'contribution',
        contributedAt: new Date(),
        confirmedAt: new Date(),
        metadata: {
          projectTitle: project.title,
          anonymous: createContributionDto.metadata?.anonymous || false,
        },
      });
  
      const saved = await contribution.save();
  
      // ✅ Update project's currentFunding
      await this.projectsService.recordContribution(
        createContributionDto.projectId,
        contributorId,
        createContributionDto.amount,
        createContributionDto.contributorWallet, // ✅ Use wallet from DTO
        createContributionDto.transactionHash
      );
  
      this.logger.log(`✅ Contribution recorded in database:
        - Contribution ID: ${saved._id}
        - Amount: ${createContributionDto.amount} MATIC
        - Status: CONFIRMED
      `);
  
      return saved;
    } catch (error) {
      this.logger.error('❌ Record contribution failed:', error.message);
      throw error;
    }
  }

  async confirmContribution(
    contributionId: string,
    confirmDto: ConfirmContributionDto,
  ): Promise<ContributionDocument> {
    try {
      const contribution = await this.contributionModel.findById(contributionId);

      if (!contribution) {
        throw new NotFoundException('Contribution not found');
      }

      if (contribution.status === ContributionStatus.CONFIRMED) {
        throw new BadRequestException('Already confirmed');
      }

      contribution.transactionHash = confirmDto.transactionHash;
      contribution.status = ContributionStatus.CONFIRMED;
      contribution.confirmedAt = new Date();

      this.logger.log(`✅ Contribution ${contributionId} confirmed with TX ${confirmDto.transactionHash}`);

      return await contribution.save();
    } catch (error) {
      this.logger.error('❌ Confirm contribution failed:', error);
      throw error;
    }
  }

  async getMyContributions(
    contributorId: string,
    query?: GetContributionsQueryDto,
  ): Promise<{ 
    contributions: ContributionDocument[]; 
    total: number; 
    page: number; 
    pages: number;
    totalMatic: number;
  }> {
    try {
      const filter: any = { contributor: contributorId };

      if (query?.status) filter.status = query.status;
      if (query?.projectId) filter.project = query.projectId;

      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const skip = (page - 1) * limit;

      const [contributions, total] = await Promise.all([
        this.contributionModel
          .find(filter)
          .populate('project', 'title description category location fundingGoal currentFunding farmerWalletAddress status blockchainProjectId')
          .populate('contributor', 'firstName lastName email')
          .sort({ contributedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.contributionModel.countDocuments(filter),
      ]);

      const confirmed = await this.contributionModel
        .find({ ...filter, status: ContributionStatus.CONFIRMED })
        .lean()
        .exec();
      
      const totalMatic = confirmed.reduce((sum: number, c: any) => sum + (c.amountMatic || 0), 0);

      return {
        contributions,
        total,
        page,
        pages: Math.ceil(total / limit),
        totalMatic,
      };
    } catch (error) {
      this.logger.error('❌ Get contributions failed:', error);
      throw error;
    }
  }

  async getContributionById(contributionId: string): Promise<ContributionDocument> {
    const contribution = await this.contributionModel
      .findById(contributionId)
      .populate('project')
      .populate('contributor', 'firstName lastName email')
      .exec();

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    return contribution;
  }

  async getProjectContributions(projectId: string): Promise<{
    contributions: ContributionDocument[];
    totalAmountMatic: number;
    contributorCount: number;
    farmerWalletAddress: string;
    blockchainProjectId: number;
    contractAddress: string;
    isFullyFunded: boolean;
    currentFunding: string;
    fundingGoal: string;
    blockchainAvailable: boolean; 
    blockchainError?: string; 
  }> {
    try {
      const project = await this.projectsService.findOne(projectId);
      
      const contributions = await this.contributionModel
        .find({ 
          project: projectId, 
          status: ContributionStatus.CONFIRMED 
        })
        .populate('contributor', 'firstName lastName email')
        .sort({ contributedAt: -1 })
        .exec();
  
      const totalAmountMatic = contributions.reduce((sum, c) => sum + (c.amountMatic || 0), 0);
      const uniqueContributors = new Set(contributions.map(c => c.contributor.toString()));
  
      let blockchainInfo: any = {
        totalFunding: (totalAmountMatic * 1e18).toString(), // Fallback to database
        fundingGoal: project.fundingGoal ? (project.fundingGoal * 1e18).toString() : '0',
        isCompleted: totalAmountMatic >= project.fundingGoal,
      };
      
      let blockchainAvailable = true;
      let blockchainError: string | undefined;
  
      if (project.blockchainProjectId !== null && project.blockchainProjectId !== undefined) {
        try {
          blockchainInfo = await this.blockchainService.getProjectInfo(project.blockchainProjectId);
        } catch (error) {
          blockchainAvailable = false;
          blockchainError = 'Blockchain data temporarily unavailable';
          this.logger.warn(`⚠️ Using database fallback for project ${projectId}`);
        }
      }
  
      return {
        contributions,
        totalAmountMatic,
        contributorCount: uniqueContributors.size,
        farmerWalletAddress: project.farmerWalletAddress,
        blockchainProjectId: project.blockchainProjectId,
        contractAddress: this.blockchainService.getContractAddress(),
        isFullyFunded: blockchainInfo.isCompleted,
        currentFunding: this.formatEther(blockchainInfo.totalFunding.toString()),
        fundingGoal: this.formatEther(blockchainInfo.fundingGoal.toString()),
        blockchainAvailable, // ✅ NEW
        blockchainError, // ✅ NEW
      };
    } catch (error) {
      this.logger.error('❌ Get project contributions failed:', error);
      throw error;
    }
  }

  async getContributorStats(contributorId: string): Promise<{
    totalContributions: number;
    totalAmountMatic: number;
    projectsSupported: number;
    confirmedContributions: number;
    pendingContributions: number;
  }> {
    try {
      const contributions = await this.contributionModel
        .find({ contributor: contributorId })
        .lean()
        .exec();

      const confirmed = contributions.filter((c: any) => c.status === ContributionStatus.CONFIRMED);
      const pending = contributions.filter((c: any) => c.status === ContributionStatus.PENDING);
      const totalAmountMatic = confirmed.reduce((sum: number, c: any) => sum + (c.amountMatic || 0), 0);
      const uniqueProjects = new Set(contributions.map((c: any) => c.project.toString()));

      return {
        totalContributions: contributions.length,
        totalAmountMatic,
        projectsSupported: uniqueProjects.size,
        confirmedContributions: confirmed.length,
        pendingContributions: pending.length,
      };
    } catch (error) {
      this.logger.error('❌ Get contributor stats failed:', error);
      throw error;
    }
  }

  async getPlatformStats(): Promise<{
    totalContributions: number;
    totalAmountMatic: number;
    totalContributors: number;
    totalProjectsFunded: number;
  }> {
    try {
      const confirmedContributions = await this.contributionModel
        .find({ status: ContributionStatus.CONFIRMED })
        .lean()
        .exec();
  
      const totalAmountMatic = confirmedContributions.reduce((sum: number, c: any) => sum + (c.amountMatic || 0), 0);
      const uniqueContributors = new Set(confirmedContributions.map((c: any) => c.contributor.toString()));
      const uniqueProjects = new Set(confirmedContributions.map((c: any) => c.project.toString()));
  
      return {
        totalContributions: confirmedContributions.length,
        totalAmountMatic,
        totalContributors: uniqueContributors.size,
        totalProjectsFunded: uniqueProjects.size,
      };
    } catch (error) {
      this.logger.error('❌ Get platform stats failed:', error);
      throw error;
    }
  }

// Add this method to your ContributionService class
async getContributionCount(projectId: string): Promise<{ count: number }> {
  try {
    const project = await this.projectsService.findOne(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.blockchainProjectId === null || project.blockchainProjectId === undefined) {
      return { count: 0 };
    }

    // Get count directly from blockchain using your existing method
    const blockchainCount = await this.blockchainService.getContributorCount(project.blockchainProjectId);

    this.logger.log(`📊 Blockchain contribution count for project ${projectId}: ${blockchainCount}`);

    return { count: blockchainCount };
  } catch (error) {
    this.logger.error('❌ Get contribution count failed:', error);
    
    // Fallback to database count if blockchain fails
    const dbCount = await this.contributionModel.countDocuments({
      project: projectId,
      status: ContributionStatus.CONFIRMED
    });
    
    return { count: dbCount };
  }
}

}