import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Contract, JsonRpcProvider, Wallet, formatEther, parseEther } from "ethers";

// ABI from deployed Remix contract
const PROJECT_FACTORY_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":false,"internalType":"address","name":"completedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"completedAt","type":"uint256"}],"name":"ProjectCompleted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"uint256","name":"fundingGoal","type":"uint256"},{"indexed":false,"internalType":"string","name":"category","type":"string"}],"name":"ProjectCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":true,"internalType":"address","name":"funder","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"ProjectFunded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isActive","type":"bool"},{"indexed":false,"internalType":"bool","name":"isCompleted","type":"bool"}],"name":"ProjectStatusChanged","type":"event"},
  {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"canCompleteProject","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"completeProject","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"contributorAmounts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_fundingGoal","type":"uint256"},{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"uint256","name":"_timeline","type":"uint256"}],"name":"createProject","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"emergencyRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"fundProject","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getAllContributions","outputs":[{"components":[{"internalType":"address","name":"contributor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ProjectFactory.ContributionInfo[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getContribution","outputs":[{"internalType":"address","name":"contributor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"}],"name":"getContributorAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getContributorCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getProject","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"fundingGoal","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timeline","type":"uint256"},{"internalType":"uint256","name":"totalFunding","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isCompleted","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"completedAt","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getProjectContributionsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getProjectContributors","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"getProjectFundingStatus","outputs":[{"internalType":"uint256","name":"currentFunding","type":"uint256"},{"internalType":"uint256","name":"fundingGoal","type":"uint256"},{"internalType":"bool","name":"isFullyFunded","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getProjectsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"}],"name":"hasContributed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"projectContributions","outputs":[{"internalType":"address","name":"contributor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"projects","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"fundingGoal","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timeline","type":"uint256"},{"internalType":"uint256","name":"totalFunding","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isCompleted","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"completedAt","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"name":"setProjectActive","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
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
      // Try multiple environment variable names for flexibility
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') 
                  || this.configService.get<string>('POLYGON_RPC_URL');
      
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY') 
                      || this.configService.get<string>('WALLET_PRIVATE_KEY');
      
      const contractAddress = this.configService.get<string>('PROJECT_FACTORY_ADDRESS') 
                           || this.configService.get<string>('CONTRACT_ADDRESS');

      // Detailed error logging
      if (!rpcUrl) {
        this.logger.error('❌ Missing RPC URL - Please set BLOCKCHAIN_RPC_URL or POLYGON_RPC_URL in .env');
      }
      if (!privateKey) {
        this.logger.error('❌ Missing Private Key - Please set BLOCKCHAIN_PRIVATE_KEY or WALLET_PRIVATE_KEY in .env');
      }
      if (!contractAddress) {
        this.logger.error('❌ Missing Contract Address - Please set PROJECT_FACTORY_ADDRESS or CONTRACT_ADDRESS in .env');
      }

      if (!rpcUrl || !privateKey || !contractAddress) {
        this.logger.warn('⚠️ Blockchain configuration incomplete - running in offline mode');
        this.logger.warn('⚠️ Add these to your .env file:');
        this.logger.warn('   BLOCKCHAIN_RPC_URL=your_rpc_url');
        this.logger.warn('   BLOCKCHAIN_PRIVATE_KEY=your_private_key');
        this.logger.warn('   PROJECT_FACTORY_ADDRESS=your_contract_address');
        this.isInitialized = false;
        return;
      }

      this.logger.log('🔗 Connecting to blockchain network...');

      // Initialize provider with optimized settings
      this.provider = new JsonRpcProvider(rpcUrl);
      
      // Increase polling interval to reduce load
      this.provider.pollingInterval = 12000; // 12 seconds

      this.wallet = new Wallet(privateKey, this.provider);
      this.contract = new Contract(contractAddress, PROJECT_FACTORY_ABI, this.wallet);

      // Test connection
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      const contractCode = await this.provider.getCode(contractAddress);
      
      if (contractCode === '0x') {
        throw new Error(`No contract found at address: ${contractAddress}`);
      }

      // Try to get project count as a final test
      const projectCount = await this.contract.getProjectsCount();

      this.isInitialized = true;
      this.logger.log(`✅ Blockchain service initialized successfully`);
      this.logger.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
      this.logger.log(`📝 Contract: ${contractAddress}`);
      this.logger.log(`👛 Wallet: ${this.wallet.address}`);
      this.logger.log(`💰 Balance: ${formatEther(balance)} ETH`);
      this.logger.log(`📊 Total Projects: ${projectCount.toString()}`);
      this.logger.log(`⚠️ Event listeners disabled (query on-demand instead)`);
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize blockchain service:', error.message);
      if (error.stack) {
        this.logger.debug(error.stack);
      }
      this.isInitialized = false;
    }
  }

  /**
   * Query recent events manually to prevent filter expiration errors
   */
  private async queryRecentEvents(eventName: string, fromBlock: number = -100) {
    if (!this.isInitialized) return [];

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock + fromBlock);
      
      const filter = this.contract.filters[eventName]();
      const events = await this.contract.queryFilter(filter, startBlock, currentBlock);
      
      return events;
    } catch (error) {
      return [];
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 2000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Max retries reached');
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
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized. Please check your configuration.');
    }
  
    return this.retryOperation(async () => {
      try {
        const fundingGoalWei = parseEther(projectData.fundingGoal.toString());
  
        // Estimate gas
        const gasEstimate = await this.contract.createProject.estimateGas(
          projectData.farmerWallet,
          projectData.title,
          projectData.description,
          fundingGoalWei,
          projectData.category,
          projectData.location,
          projectData.timeline
        );

        const gasLimit = (gasEstimate * 120n) / 100n; // 20% buffer

        const tx = await this.contract.createProject(
          projectData.farmerWallet,
          projectData.title,
          projectData.description,
          fundingGoalWei,
          projectData.category,
          projectData.location,
          projectData.timeline,
          { gasLimit }
        );
  
        this.logger.log(`⏳ Creating project on blockchain... TX: ${tx.hash}`);
  
        const receipt = await tx.wait(1);
  
        if (!receipt) {
          throw new Error('Transaction receipt is null');
        }
  
        // Parse ProjectCreated event
        let projectId = 0;
        
        for (const log of receipt.logs) {
          try {
            const parsedLog = this.contract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            
            if (parsedLog && parsedLog.name === 'ProjectCreated') {
              if (parsedLog.args && parsedLog.args.projectId) {
                projectId = Number(parsedLog.args.projectId);
                this.logger.log(`✅ Project created with ID: ${projectId}`);
                break;
              }
            }
          } catch (error) {
            continue;
          }
        }
        
        if (projectId === 0) {
          throw new Error('ProjectCreated event not found in transaction');
        }
  
        this.logger.log(`✅ Project ${projectId} created successfully - TX: ${receipt.hash}`);
  
        return { projectId, txHash: receipt.hash };
      } catch (error) {
        this.logger.error('❌ Blockchain transaction failed:', error.message);
        throw error;
      }
    }, 3, 2000);
  }

  async getProjectFromChain(projectId: number): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const project = await this.contract.getProject(projectId);
      
      return {
        projectId,
        owner: project.owner,
        title: project.title,
        description: project.description,
        fundingGoal: project.fundingGoal.toString(),
        category: project.category,
        location: project.location,
        timeline: Number(project.timeline),
        totalFunding: project.totalFunding.toString(),
        isActive: project.isActive,
        isCompleted: project.isCompleted,
        createdAt: Number(project.createdAt),
        completedAt: Number(project.completedAt)
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get project ${projectId}:`, error.message);
      throw error;
    }
  }

  async getProjectFundingStatus(projectId: number): Promise<{
    currentFunding: string;
    fundingGoal: string;
    isFullyFunded: boolean;
  }> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const status = await this.contract.getProjectFundingStatus(projectId);
      
      return {
        currentFunding: formatEther(status.currentFunding),
        fundingGoal: formatEther(status.fundingGoal),
        isFullyFunded: status.isFullyFunded
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get funding status for project ${projectId}:`, error.message);
      throw error;
    }
  }

  async checkProjectCompletion(projectId: number): Promise<{
    isCompleted: boolean;
    isFunded: boolean;
    totalFunding: string;
    fundingGoal: string;
    canComplete: boolean;
  }> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const project = await this.getProjectFromChain(projectId);
      const fundingStatus = await this.getProjectFundingStatus(projectId);
      const canComplete = await this.contract.canCompleteProject(projectId);
      
      return {
        isCompleted: project.isCompleted,
        isFunded: fundingStatus.isFullyFunded,
        totalFunding: fundingStatus.currentFunding,
        fundingGoal: fundingStatus.fundingGoal,
        canComplete
      };
    } catch (error) {
      this.logger.error(`❌ Failed to check completion for project ${projectId}:`, error.message);
      throw error;
    }
  }

  async completeProjectOnChain(projectId: number): Promise<{ txHash: string }> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const canComplete = await this.contract.canCompleteProject(projectId);
      if (!canComplete) {
        throw new Error('Project cannot be completed (funding goal not met or not active)');
      }

      const gasEstimate = await this.contract.completeProject.estimateGas(projectId);
      
      const tx = await this.contract.completeProject(projectId, {
        gasLimit: (gasEstimate * 120n) / 100n
      });

      this.logger.log(`⏳ Completing project ${projectId}... TX: ${tx.hash}`);

      const receipt = await tx.wait();

      this.logger.log(`✅ Project ${projectId} completed - TX: ${receipt?.hash}`);

      return {
        txHash: receipt?.hash || tx.hash
      };
    } catch (error) {
      this.logger.error(`❌ Failed to complete project ${projectId}:`, error.message);
      throw error;
    }
  }

  async getTotalProjectsCount(): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const count = await this.contract.getProjectsCount();
      return Number(count);
    } catch (error) {
      this.logger.error('❌ Failed to get projects count:', error.message);
      throw error;
    }
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

  async getRecentProjectCreations(limit: number = 10): Promise<any[]> {
    const events = await this.queryRecentEvents('ProjectCreated', -100);
    return events.slice(-limit).map(event => {
      if ('args' in event && event.args) {
        return {
          projectId: Number(event.args.projectId),
          owner: event.args.owner,
          title: event.args.title,
          fundingGoal: formatEther(event.args.fundingGoal),
          category: event.args.category,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
      }
      return null;
    }).filter(Boolean);
  }
}