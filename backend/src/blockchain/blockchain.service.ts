import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Contract, JsonRpcProvider, Wallet, formatEther, parseEther } from "ethers";

const PROJECT_FACTORY_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"platformFee","type":"uint256"}],"name":"FundsReleased","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":false,"internalType":"address","name":"completedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"completedAt","type":"uint256"}],"name":"ProjectCompleted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"uint256","name":"fundingGoal","type":"uint256"}],"name":"ProjectCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":true,"internalType":"address","name":"funder","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"ProjectFunded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":true,"internalType":"address","name":"contributor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RefundIssued","type":"event"},
  {"inputs":[],"name":"MIN_CONTRIBUTION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MIN_FUNDING_GOAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"contribute","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"contributorAmounts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_fundingGoal","type":"uint256"},{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"uint256","name":"_timeline","type":"uint256"}],"name":"createProject","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"fundProject","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"}],"name":"getContributorAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getContributorCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getMinimumContribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},
  {"inputs":[],"name":"getMinimumFundingGoal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getProjectInfo","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"fundingGoal","type":"uint256"},{"internalType":"uint256","name":"totalFunding","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isCompleted","type":"bool"},{"internalType":"bool","name":"fundsReleased","type":"bool"},{"internalType":"uint256","name":"fundingDeadline","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getProjectsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"}],"name":"hasContributed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"platformFeePercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"projectContributions","outputs":[{"internalType":"address","name":"contributor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"projects","outputs":[{"internalType":"address payable","name":"owner","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"fundingGoal","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timeline","type":"uint256"},{"internalType":"uint256","name":"totalFunding","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isCompleted","type":"bool"},{"internalType":"bool","name":"fundsReleased","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"completedAt","type":"uint256"},{"internalType":"uint256","name":"fundingDeadline","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"requestRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"bool","name":"_isActive","type":"bool"}],"name":"setProjectActive","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"stateMutability":"payable","type":"receive"}
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeBlockchain();
  }

  private async initializeBlockchain() {
    try {
      const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
      const privateKey = this.configService.get<string>('PRIVATE_KEY');
      const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

      if (!rpcUrl || !privateKey || !contractAddress) {
        this.logger.warn('⚠️ Blockchain configuration incomplete');
        return;
      }

      this.logger.log('🔗 Connecting to Polygon...');

      this.provider = new JsonRpcProvider(rpcUrl);
      this.wallet = new Wallet(privateKey, this.provider);
      this.contract = new Contract(contractAddress, PROJECT_FACTORY_ABI, this.wallet);

      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      const projectCount = await this.contract.getProjectsCount();
      const platformFee = await this.contract.platformFeePercentage();

      this.isInitialized = true;
      this.logger.log(`✅ Blockchain initialized`);
      this.logger.log(`📍 Contract: ${contractAddress}`);
      this.logger.log(`👛 Admin: ${this.wallet.address}`);
      this.logger.log(`💰 Balance: ${formatEther(balance)} MATIC`);
      this.logger.log(`📊 Projects: ${projectCount.toString()}`);
      this.logger.log(`💵 Fee: ${platformFee}%`);
      
    } catch (error) {
      this.logger.error('❌ Blockchain init failed:', error.message);
      this.isInitialized = false;
    }
  }

  async createProjectOnChain(projectData: {
    title: string;
    description: string;
    fundingGoal: number;
    category: string;
    location: string;
    timeline: number;
    farmerWallet: string;
  }): Promise<{ projectId: number; txHash: string }> {
    if (!this.isInitialized) throw new Error('Blockchain not initialized');

    try {
      const fundingGoalWei = parseEther(projectData.fundingGoal.toString());

      this.logger.log(`🚀 Creating: ${projectData.title}`);

      const tx = await this.contract.createProject(
        projectData.farmerWallet,
        projectData.title,
        projectData.description,
        fundingGoalWei,
        projectData.category,
        projectData.location,
        projectData.timeline
      );

      const receipt = await tx.wait();

      let projectId = 0;
      for (const log of receipt.logs) {
        try {
          const parsed = this.contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
          if (parsed?.name === 'ProjectCreated') {
            projectId = Number(parsed.args.projectId);
            break;
          }
        } catch {}
      }

      this.logger.log(`✅ Project ${projectId} created`);

      return { projectId, txHash: receipt.hash };
    } catch (error) {
      this.logger.error('❌ Create failed:', error.message);
      throw error;
    }
  }

  // FIXED: Added public getProjectInfo method
  async getProjectInfo(projectId: number): Promise<{
    owner: string;
    fundingGoal: bigint;
    totalFunding: bigint;
    isActive: boolean;
    isCompleted: boolean;
    fundsReleased: boolean;
    fundingDeadline: bigint;
  }> {
    if (!this.isInitialized) throw new Error('Blockchain not initialized');

    try {
      const result = await this.contract.getProjectInfo(projectId);
      
      return {
        owner: result[0],
        fundingGoal: result[1],
        totalFunding: result[2],
        isActive: result[3],
        isCompleted: result[4],
        fundsReleased: result[5],
        fundingDeadline: result[6],
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get project info for ID ${projectId}:`, error.message);
      throw error;
    }
  }

  async getProjectFromChain(projectId: number): Promise<any> {
    if (!this.isInitialized) throw new Error('Not initialized');

    const info = await this.contract.getProjectInfo(projectId);
    
    return {
      owner: info[0],
      fundingGoal: formatEther(info[1]),
      totalFunding: formatEther(info[2]),
      isActive: info[3],
      isCompleted: info[4],
      fundsReleased: info[5],
      fundingDeadline: new Date(Number(info[6]) * 1000),
    };
  }

  async setProjectActive(projectId: number, isActive: boolean): Promise<string> {
    if (!this.isInitialized) throw new Error('Not initialized');

    const tx = await this.contract.setProjectActive(projectId, isActive);
    const receipt = await tx.wait();

    this.logger.log(`✅ Project ${projectId} ${isActive ? 'activated' : 'deactivated'}`);

    return receipt.hash;
  }

  async getContributorAmount(projectId: number, address: string): Promise<string> {
    const amount = await this.contract.getContributorAmount(projectId, address);
    return formatEther(amount);
  }

  async getContributorCount(projectId: number): Promise<number> {
    const count = await this.contract.getContributorCount(projectId);
    return Number(count);
  }

  async getContractBalance(): Promise<string> {
    const balance = await this.contract.getContractBalance();
    return formatEther(balance);
  }

  async getTotalProjectsCount(): Promise<number> {
    const count = await this.contract.getProjectsCount();
    return Number(count);
  }

  isConnected(): boolean {
    return this.isInitialized;
  }

  getWalletAddress(): string {
    return this.isInitialized ? this.wallet.address : 'Not connected';
  }

  getContractAddress(): string {
    return this.isInitialized ? this.contract.target.toString() : 'Not connected';
  }
}