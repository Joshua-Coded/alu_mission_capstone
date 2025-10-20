import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { formatEther, parseEther } from "ethers";
import { Model } from "mongoose";
import { BlockchainService } from "../blockchain/blockchain.service";
import { ProjectsService } from "../projects/projects.service";
import { ConfirmContributionDto, CreateContributionDto, CreateWithdrawalDto, GetContributionsQueryDto, ProcessWithdrawalDto } from "./dto/contribution.dto";
import { Contribution, ContributionDocument, ContributionStatus, TransactionType } from "./schemas/contribution.schema";
import { Withdrawal, WithdrawalDocument, WithdrawalStatus } from "./schemas/withdrawal.schema";

@Injectable()
export class ContributionService {
    create(createDto: {
        projectId: string; amount: number; currency: "ETH"; // Create contribution record
    }, arg1: string) {
        throw new Error("Method not implemented.");
    }
  private readonly logger = new Logger(ContributionService.name);

  constructor(
    @InjectModel(Contribution.name) private contributionModel: Model<ContributionDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    private blockchainService: BlockchainService,
    private projectsService: ProjectsService,
  ) {}

  // ==================== CONTRIBUTOR METHODS ====================

  /**
   * Record a contribution to a project
   */
  async createContribution(
    contributorId: string,
    createContributionDto: CreateContributionDto,
  ): Promise<ContributionDocument> {
    try {
      // Verify project exists and is verified
      const project = await this.projectsService.findOne(createContributionDto.projectId);
      
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.status !== 'verified') {
        throw new BadRequestException('Project is not verified for funding');
      }

      // Check if project has blockchain ID
      if (!project.blockchainProjectId && project.blockchainProjectId !== 0) {
        throw new BadRequestException('Project not yet on blockchain');
      }

      // Verify blockchain project exists
      const blockchainProject = await this.blockchainService.getProjectFromChain(
        createContributionDto.blockchainProjectId
      );

      if (!blockchainProject.isActive) {
        throw new BadRequestException('Project is not active on blockchain');
      }

      // Convert ETH to Wei
      const amountWei = parseEther(createContributionDto.amountEth.toString());

      // Get ETH to RWF rate at time of contribution
      const ethToRwfRate = await this.getEthToRwfRate();
      const amountRwf = createContributionDto.amountEth * ethToRwfRate;

      // Create contribution record
      const contribution = new this.contributionModel({
        contributor: contributorId,
        project: createContributionDto.projectId,
        blockchainProjectId: createContributionDto.blockchainProjectId,
        contributorWallet: createContributionDto.contributorWallet,
        amountEth: createContributionDto.amountEth,
        amountWei: amountWei.toString(),
        ethToRwfRate,
        amountRwf,
        transactionHash: createContributionDto.transactionHash,
        status: createContributionDto.transactionHash 
          ? ContributionStatus.PENDING 
          : ContributionStatus.PENDING,
        transactionType: TransactionType.CONTRIBUTION,
        contributedAt: new Date(),
        metadata: {
          projectTitle: project.title,
          notes: createContributionDto.notes,
        },
      });

      const savedContribution = await contribution.save();

      this.logger.log(
        `✅ Contribution recorded: ${savedContribution._id} - ` +
        `${createContributionDto.amountEth} ETH (${amountRwf.toLocaleString()} RWF) ` +
        `for project ${project.title}`
      );

      return savedContribution;
    } catch (error) {
      this.logger.error('❌ Failed to create contribution:', error);
      throw error;
    }
  }

  /**
   * Confirm a contribution after blockchain transaction
   */
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
        throw new BadRequestException('Contribution already confirmed');
      }

      // Update contribution with blockchain data
      contribution.transactionHash = confirmDto.transactionHash;
      contribution.blockNumber = confirmDto.blockNumber;
      contribution.gasUsed = confirmDto.gasUsed;
      contribution.status = ContributionStatus.CONFIRMED;
      contribution.confirmedAt = new Date();

      const updated = await contribution.save();

      // *** FIXED: Remove the updateProjectFunding call ***
      // The project funding is tracked on the blockchain
      // We just need to track it in our contribution records
      
      this.logger.log(
        `✅ Contribution confirmed: ${contributionId} - ` +
        `TX: ${confirmDto.transactionHash} - ` +
        `${contribution.amountEth} ETH (${contribution.amountRwf?.toLocaleString()} RWF)`
      );

      return updated;
    } catch (error) {
      this.logger.error('❌ Failed to confirm contribution:', error);
      throw error;
    }
  }

  /**
   * Get contributions for a contributor
   */
  async getMyContributions(
    contributorId: string,
    query?: GetContributionsQueryDto,
  ): Promise<{ 
    contributions: ContributionDocument[]; 
    total: number; 
    page: number; 
    pages: number;
    totalEth: number;
    totalRwf: number;
  }> {
    try {
      const filter: any = { contributor: contributorId };

      if (query?.status) {
        filter.status = query.status;
      }

      if (query?.projectId) {
        filter.project = query.projectId;
      }

      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const skip = (page - 1) * limit;

      const [contributions, total] = await Promise.all([
        this.contributionModel
          .find(filter)
          .populate('project', 'title description category location fundingGoal totalFunding')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.contributionModel.countDocuments(filter),
      ]);

      // Calculate totals for confirmed contributions
      const confirmedContributions = await this.contributionModel
        .find({ ...filter, status: ContributionStatus.CONFIRMED })
        .exec();
      
      const totalEth = confirmedContributions.reduce((sum, c) => sum + c.amountEth, 0);
      const totalRwf = confirmedContributions.reduce((sum, c) => sum + (c.amountRwf || 0), 0);

      return {
        contributions,
        total,
        page,
        pages: Math.ceil(total / limit),
        totalEth,
        totalRwf,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get contributions:', error);
      throw error;
    }
  }

  /**
   * Get contribution details
   */
  async getContributionById(contributionId: string): Promise<ContributionDocument> {
    const contribution = await this.contributionModel
      .findById(contributionId)
      .populate('project')
      .populate('contributor', 'name email')
      .exec();

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    return contribution;
  }

  /**
   * Get contributions for a specific project
   */
  async getProjectContributions(projectId: string): Promise<{
    contributions: ContributionDocument[];
    totalAmountEth: number;
    totalAmountRwf: number;
    contributorCount: number;
  }> {
    try {
      const contributions = await this.contributionModel
        .find({ 
          project: projectId, 
          status: ContributionStatus.CONFIRMED 
        })
        .populate('contributor', 'name email')
        .sort({ createdAt: -1 })
        .exec();

      const totalAmountEth = contributions.reduce((sum, c) => sum + c.amountEth, 0);
      const totalAmountRwf = contributions.reduce((sum, c) => sum + (c.amountRwf || 0), 0);
      const uniqueContributors = new Set(contributions.map(c => c.contributor.toString()));

      return {
        contributions,
        totalAmountEth,
        totalAmountRwf,
        contributorCount: uniqueContributors.size,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get project contributions:', error);
      throw error;
    }
  }

  /**
   * Get contribution statistics for a contributor
   */
  async getContributorStats(contributorId: string): Promise<{
    totalContributions: number;
    totalAmountEth: number;
    totalAmountRwf: number;
    projectsSupported: number;
    confirmedContributions: number;
    pendingContributions: number;
  }> {
    try {
      const contributions = await this.contributionModel.find({ contributor: contributorId });

      const confirmed = contributions.filter(c => c.status === ContributionStatus.CONFIRMED);
      const pending = contributions.filter(c => c.status === ContributionStatus.PENDING);
      const totalAmountEth = confirmed.reduce((sum, c) => sum + c.amountEth, 0);
      const totalAmountRwf = confirmed.reduce((sum, c) => sum + (c.amountRwf || 0), 0);
      const uniqueProjects = new Set(contributions.map(c => c.project.toString()));

      return {
        totalContributions: contributions.length,
        totalAmountEth,
        totalAmountRwf,
        projectsSupported: uniqueProjects.size,
        confirmedContributions: confirmed.length,
        pendingContributions: pending.length,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get contributor stats:', error);
      throw error;
    }
  }

  // ==================== WITHDRAWAL METHODS ====================

  /**
   * Request withdrawal (farmer)
   */
  async requestWithdrawal(
    farmerId: string,
    createWithdrawalDto: CreateWithdrawalDto,
  ): Promise<WithdrawalDocument> {
    try {
      // Verify project ownership
      const project = await this.projectsService.findOne(createWithdrawalDto.projectId);
      
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.farmer.toString() !== farmerId) {
        throw new HttpException('Not project owner', HttpStatus.FORBIDDEN);
      }

      // Check if project is completed on blockchain
      const blockchainStatus = await this.blockchainService.checkProjectCompletion(
        createWithdrawalDto.blockchainProjectId
      );

      if (!blockchainStatus.isCompleted) {
        throw new BadRequestException('Project not completed on blockchain');
      }

      // Get current ETH to RWF rate
      const ethToRwfRate = await this.getEthToRwfRate();
      const amountRwf = parseFloat(blockchainStatus.totalFunding) * ethToRwfRate;

      // Create withdrawal request
      const withdrawal = new this.withdrawalModel({
        farmer: farmerId,
        project: createWithdrawalDto.projectId,
        blockchainProjectId: createWithdrawalDto.blockchainProjectId,
        farmerWallet: createWithdrawalDto.farmerWallet,
        amountEth: parseFloat(blockchainStatus.totalFunding),
        amountWei: parseEther(blockchainStatus.totalFunding).toString(),
        ethToRwfRate,
        amountRwf,
        paymentMethod: createWithdrawalDto.paymentMethod,
        recipientPhone: createWithdrawalDto.recipientPhone,
        recipientBankAccount: createWithdrawalDto.recipientBankAccount,
        recipientBankName: createWithdrawalDto.recipientBankName,
        recipientName: createWithdrawalDto.recipientName,
        status: WithdrawalStatus.PENDING,
        requestedAt: new Date(),
        metadata: {
          projectTitle: project.title,
          notes: createWithdrawalDto.notes,
        },
      });

      const saved = await withdrawal.save();

      this.logger.log(
        `✅ Withdrawal requested: ${saved._id} - ` +
        `${saved.amountEth} ETH → ${saved.amountRwf.toLocaleString()} RWF ` +
        `(Rate: ${ethToRwfRate.toLocaleString()}) - ` +
        `Project: ${project.title}`
      );

      return saved;
    } catch (error) {
      this.logger.error('❌ Failed to request withdrawal:', error);
      throw error;
    }
  }

  /**
   * Process withdrawal (admin/government)
   */
  async processWithdrawal(
    withdrawalId: string,
    processedBy: string,
    processDto: ProcessWithdrawalDto,
  ): Promise<WithdrawalDocument> {
    try {
      const withdrawal = await this.withdrawalModel.findById(withdrawalId);

      if (!withdrawal) {
        throw new NotFoundException('Withdrawal not found');
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        throw new BadRequestException('Withdrawal already processed');
      }

      // Calculate transaction fee (example: 1% fee)
      const transactionFee = withdrawal.amountRwf * 0.01;
      const finalAmount = withdrawal.amountRwf - transactionFee;

      withdrawal.status = WithdrawalStatus.COMPLETED;
      withdrawal.paymentReference = processDto.paymentReference;
      withdrawal.blockchainTxHash = processDto.blockchainTxHash;
      withdrawal.processedBy = processedBy;
      withdrawal.transactionFee = transactionFee;
      withdrawal.finalAmountRwf = finalAmount;
      withdrawal.processedAt = new Date();
      withdrawal.completedAt = new Date();

      const updated = await withdrawal.save();

      this.logger.log(
        `✅ Withdrawal processed: ${withdrawalId} - ` +
        `Paid: ${finalAmount.toLocaleString()} RWF ` +
        `(Fee: ${transactionFee.toLocaleString()} RWF) - ` +
        `Ref: ${processDto.paymentReference}`
      );

      return updated;
    } catch (error) {
      this.logger.error('❌ Failed to process withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get farmer withdrawals
   */
  async getFarmerWithdrawals(farmerId: string): Promise<WithdrawalDocument[]> {
    try {
      return await this.withdrawalModel
        .find({ farmer: farmerId })
        .populate('project', 'title description category')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error('❌ Failed to get farmer withdrawals:', error);
      throw error;
    }
  }

  /**
   * Get all pending withdrawals (admin)
   */
  async getPendingWithdrawals(): Promise<WithdrawalDocument[]> {
    try {
      return await this.withdrawalModel
        .find({ status: WithdrawalStatus.PENDING })
        .populate('project', 'title description')
        .populate('farmer', 'name email phone')
        .sort({ requestedAt: 1 })
        .exec();
    } catch (error) {
      this.logger.error('❌ Failed to get pending withdrawals:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get ETH to RWF exchange rate
   * In production, integrate with a real API like CoinGecko or your preferred provider
   */
  private async getEthToRwfRate(): Promise<number> {
    // TODO: Integrate with real exchange rate API
    // Example integration with CoinGecko:
    /*
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=rwf'
      );
      const data = await response.json();
      return data.ethereum.rwf;
    } catch (error) {
      this.logger.warn('Failed to fetch real-time rate, using default', error);
      return 3900000; // Fallback rate
    }
    */

    // For simulation, using approximate rate
    // 1 ETH = ~$3000 USD
    // 1 USD = ~1300 RWF
    // So 1 ETH = ~3,900,000 RWF
    return 3900000;
  }

  /**
   * Simulate ETH to RWF conversion
   */
  async convertEthToRwf(amountEth: number): Promise<{
    amountEth: number;
    amountRwf: number;
    exchangeRate: number;
  }> {
    const rate = await this.getEthToRwfRate();
    return {
      amountEth,
      amountRwf: amountEth * rate,
      exchangeRate: rate,
    };
  }

 /**
 * Get platform contribution statistics
 */
async getPlatformStats(): Promise<{
    totalContributions: number;
    totalAmountEth: number;
    totalAmountRwf: number;
    totalContributors: number;
    totalProjectsFunded: number;
    totalWithdrawals: number;
    totalWithdrawnRwf: number;
  }> {
    try {
      const confirmedContributions = await this.contributionModel.find({ 
        status: ContributionStatus.CONFIRMED 
      });
  
      const completedWithdrawals = await this.withdrawalModel.find({ 
        status: WithdrawalStatus.COMPLETED 
      });
  
      const totalAmountEth = confirmedContributions.reduce((sum, c) => sum + c.amountEth, 0);
      const totalAmountRwf = confirmedContributions.reduce((sum, c) => sum + (c.amountRwf || 0), 0);
      const uniqueContributors = new Set(confirmedContributions.map(c => c.contributor.toString()));
      const uniqueProjects = new Set(confirmedContributions.map(c => c.project.toString())); // FIXED: Added missing >
      const totalWithdrawnRwf = completedWithdrawals.reduce((sum, w) => sum + (w.finalAmountRwf || 0), 0);
  
      return {
        totalContributions: confirmedContributions.length,
        totalAmountEth,
        totalAmountRwf,
        totalContributors: uniqueContributors.size,
        totalProjectsFunded: uniqueProjects.size,
        totalWithdrawals: completedWithdrawals.length,
        totalWithdrawnRwf,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get platform stats:', error);
      throw error;
    }
  }
}