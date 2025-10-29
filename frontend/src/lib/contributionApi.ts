import axios, { AxiosError, AxiosInstance } from "axios";

// ============= TYPES & INTERFACES =============

export interface Contribution {
  amount: any;
  _id: string;
  project: {
    _id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    fundingGoal: number;
    currentFunding: number;
    status: string;
    blockchainProjectId?: number;
    farmerWalletAddress?: string;
  };
  contributor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    walletAddress?: string;
  };
  blockchainProjectId: number;
  farmerWalletAddress: string;
  amountMatic: number;
  amountWei: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionType: 'contribution' | 'withdrawal' | 'refund';
  contributedAt: string;
  confirmedAt?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasFee?: string;
  metadata?: {
    projectTitle?: string;
    anonymous?: boolean;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContributionStats {
  totalContributions: number;
  totalAmountMatic: number;
  projectsSupported: number;
  confirmedContributions: number;
  pendingContributions: number;
  recentContributions?: Contribution[];
  averageContribution?: number;
  topProject?: {
    projectId: string;
    title: string;
    totalContributed: number;
  };
}

export interface ProjectContributionInfo {
  project: any;
  blockchainProjectId: number;
  farmerWalletAddress: string;
  contractAddress: string;
  currentFunding: string;
  fundingGoal: string;
  isFullyFunded: boolean;
  isActive: boolean;
  fundingDeadline: string;
  instructions: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  minContribution?: number;
  maxContribution?: number;
}

export interface ProjectContributions {
  contributions: Contribution[];
  totalAmountMatic: number;
  contributorCount: number;
  farmerWalletAddress: string;
  blockchainProjectId: number;
  contractAddress: string;
  isFullyFunded: boolean;
  currentFunding: string;
  fundingGoal: string;
  projectDetails?: {
    title: string;
    description: string;
    status: string;
    category: string;
  };
}

export interface PlatformStats {
  totalContributions: number;
  totalAmountMatic: number;
  totalContributors: number;
  totalProjectsFunded: number;
  averageContribution: number;
  monthlyGrowth: number;
  recentActivity: Contribution[];
}

export interface CreateContributionDto {
  projectId: string;
  amount: number;
  currency?: 'MATIC';
  paymentMethod: 'blockchain';
  contributorWallet: string; 
  transactionHash: string;
  metadata?: {
    anonymous?: boolean;
    notes?: string;
  };
}

export interface ConfirmContributionDto {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface NetworkInfo {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
}

// ============= BLOCKCHAIN CONSTANTS =============

export const BLOCKCHAIN_CONSTANTS = {
  // Function selectors
  CONTRIBUTE_SELECTOR: '0xc1cbbca7',
  
  // Network info - FIXED: Added chainName property
  POLYGON_MAINNET: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    chainName: 'Polygon Mainnet', // ✅ ADDED: Missing property
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: false,
  },

  POLYGON_TESTNET: {
    chainId: 80001,
    chainIdHex: '0x13881',
    name: 'Polygon Mumbai',
    chainName: 'Polygon Mumbai Testnet', // ✅ ADDED: Missing property
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: true,
  },

  // Contract addresses - using environment variable
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_ROOTRISE_CONTRACT || '0x5387c3bC42304EbfCEFB0aAD1034753217C01b65',
  
  // Minimum values
  MIN_CONTRIBUTION: 0.001, // MATIC (Smart contract minimum)
  MAX_CONTRIBUTION: 10000, // MATIC (Arbitrary limit for safety)
  
  // Gas limits
  DEFAULT_GAS_LIMIT: 300000,
  CONTRIBUTE_GAS_LIMIT: 500000,
} as const;

// ============= API CLIENT CLASS =============

class ContributionApiClient {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1') {
    this.baseURL = baseURL;
    
    // ✅ CRITICAL FIX: Use correct base URL structure
    this.api = axios.create({
      baseURL: this.baseURL, // NOT `${baseURL}/contributions` - backend uses /api/v1/contributions as full path
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string }>) => { // ✅ FIXED: Added proper type for error response
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        // ✅ FIXED: Proper error message extraction
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || 'Network error occurred';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // ============= BLOCKCHAIN TRANSACTION HELPERS =============

  /**
   * Build transaction data for contribute function
   */
  buildContributeData(blockchainProjectId: number): string {
    const projectIdNumber = Number(blockchainProjectId);
    const paddedProjectId = projectIdNumber.toString(16).padStart(64, '0');
    return BLOCKCHAIN_CONSTANTS.CONTRIBUTE_SELECTOR + paddedProjectId;
  }

  /**
   * Parse MATIC amount to Wei (hex string)
   */
  parseMaticToWeiHex(amountMatic: string | number): string {
    try {
      const wei = BigInt(Math.floor(Number(amountMatic) * 1e18));
      return '0x' + wei.toString(16);
    } catch (error) {
      throw new Error(`Invalid amount: ${amountMatic}`);
    }
  }

  /**
   * Format Wei to MATIC for display
   */
  formatWeiToMatic(wei: string | bigint): number {
    try {
      const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
      return Number(weiValue) / 1e18;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate transaction parameters before sending
   */
  validateTransactionParams(params: {
    amount: string | number;
    blockchainProjectId: number;
    contractAddress: string;
    userAddress: string;
  }): { valid: boolean; error?: string } {
    const { amount, blockchainProjectId, contractAddress, userAddress } = params;

    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(amountNumber) || amountNumber <= 0) {
      return {
        valid: false,
        error: 'Invalid contribution amount',
      };
    }

    if (amountNumber < BLOCKCHAIN_CONSTANTS.MIN_CONTRIBUTION) {
      return {
        valid: false,
        error: `Minimum contribution is ${BLOCKCHAIN_CONSTANTS.MIN_CONTRIBUTION} MATIC`,
      };
    }

    if (amountNumber > BLOCKCHAIN_CONSTANTS.MAX_CONTRIBUTION) {
      return {
        valid: false,
        error: `Maximum contribution is ${BLOCKCHAIN_CONSTANTS.MAX_CONTRIBUTION} MATIC`,
      };
    }

    if (blockchainProjectId === null || blockchainProjectId === undefined || blockchainProjectId < 0) {
      return {
        valid: false,
        error: 'Invalid blockchain project ID',
      };
    }

    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return {
        valid: false,
        error: 'Invalid contract address',
      };
    }

    if (!userAddress || !userAddress.startsWith('0x') || userAddress.length !== 42) {
      return {
        valid: false,
        error: 'Invalid user address',
      };
    }

    return { valid: true };
  }

  // ============= CONTRIBUTION METHODS =============

  /**
   * ✅ FIXED: Get project contribution info with correct endpoint
   */
  async getProjectContributionInfo(projectId: string): Promise<ApiResponse<ProjectContributionInfo>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get<ProjectContributionInfo>(
        `/contributions/project/${projectId}/contribution-info`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      
      return {
        success: false,
        error: errorMessage || 'Failed to fetch contribution info',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Check if project is ready for contributions
   */
  async isProjectReadyForContributions(projectId: string): Promise<ApiResponse<{
    ready: boolean;
    reason?: string;
    project?: any;
    blockchainInfo?: any;
  }>> {
    try {
      const projectResponse = await this.api.get(`${this.baseURL}/projects/${projectId}`);
      const project = projectResponse.data;

      // Enhanced status checking
      if (!['active', 'verified'].includes(project.status)) {
        return {
          success: true,
          data: {
            ready: false,
            reason: `Project is ${project.status}. Only active or verified projects can receive contributions.`,
            project
          }
        };
      }

      if (project.blockchainProjectId === null || project.blockchainProjectId === undefined) {
        return {
          success: true,
          data: {
            ready: false,
            reason: 'Project not yet deployed to blockchain. Please try again later.',
            project
          }
        };
      }

      if (project.blockchainStatus !== 'created') {
        return {
          success: true,
          data: {
            ready: false,
            reason: `Blockchain deployment status: ${project.blockchainStatus}. Please wait for deployment to complete.`,
            project
          }
        };
      }

      // Check if project is already fully funded
      if (project.currentFunding >= project.fundingGoal) {
        return {
          success: true,
          data: {
            ready: false,
            reason: 'Project is already fully funded.',
            project
          }
        };
      }

      return {
        success: true,
        data: {
          ready: true,
          project
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check project status'
      };
    }
  }

  /**
   * Complete contribution preparation with validation
   */
  async prepareContribution(projectId: string, amount: number): Promise<ApiResponse<{
    contractInfo: {
      blockchainProjectId: number;
      contractAddress: string;
      farmerWalletAddress: string;
      currentFunding: string;
      fundingGoal: string;
      isFullyFunded: boolean;
    };
    transactionData: {
      data: string;
      value: string;
      gasLimit: string;
      to: string;
    };
    instructions: string[];
    network: NetworkInfo;
  }>> {
    try {
      // Step 1: Check if project is ready
      const readinessCheck = await this.isProjectReadyForContributions(projectId);
      if (!readinessCheck.success || !readinessCheck.data?.ready) {
        return {
          success: false,
          error: readinessCheck.data?.reason || 'Project not ready for contributions'
        };
      }

      // Step 2: Get detailed contribution info
      const contributionInfo = await this.getProjectContributionInfo(projectId);
      if (!contributionInfo.success) {
        return {
          success: false,
          error: contributionInfo.error
        };
      }

      const { 
        blockchainProjectId, 
        contractAddress, 
        farmerWalletAddress,
        currentFunding,
        fundingGoal,
        isFullyFunded
      } = contributionInfo.data!;

      // Step 3: Validate transaction parameters
      const validation = this.validateTransactionParams({
        amount,
        blockchainProjectId,
        contractAddress,
        userAddress: '', // Will be set by frontend
      });

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Step 4: Build transaction data
      const transactionData = this.buildContributeData(blockchainProjectId);
      const valueHex = this.parseMaticToWeiHex(amount);

      // ✅ FIXED: Use proper network object with chainName
      const networkInfo: NetworkInfo = {
        chainId: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.chainId,
        chainName: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.chainName,
        rpcUrl: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.rpcUrl,
        explorerUrl: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.explorerUrl,
        nativeCurrency: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.nativeCurrency,
        isTestnet: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.isTestnet,
      };

      return {
        success: true,
        data: {
          contractInfo: {
            blockchainProjectId,
            contractAddress,
            farmerWalletAddress,
            currentFunding,
            fundingGoal,
            isFullyFunded
          },
          transactionData: {
            data: transactionData,
            value: valueHex,
            gasLimit: '0x' + BLOCKCHAIN_CONSTANTS.CONTRIBUTE_GAS_LIMIT.toString(16),
            to: contractAddress,
          },
          instructions: [
            `Call contribute(${blockchainProjectId}) on contract`,
            `Send ${amount} MATIC`,
            `Funds held in escrow until funding goal reached`,
            `Auto-release to farmer upon completion`
          ],
          network: networkInfo // ✅ FIXED: Using properly typed network object
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to prepare contribution'
      };
    }
  }

  /**
   * ✅ FIXED: Create a new contribution with correct endpoint
   */
  async createContribution(data: CreateContributionDto): Promise<ApiResponse<Contribution>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.post<Contribution>('/contributions', data);
      return {
        success: true,
        data: response.data,
        message: 'Contribution recorded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create contribution',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Record contribution after successful blockchain transaction
   */
async recordContributionAfterTransaction(
  projectId: string, 
  amount: number, 
  transactionHash: string,
  contributorWallet: string, // ✅ NOW 3rd parameter (required)
  metadata?: { anonymous?: boolean; notes?: string } // ✅ NOW 4th parameter (optional)
): Promise<ApiResponse<Contribution>> {
  try {
    const contribution = await this.createContribution({
      projectId,
      amount,
      currency: 'MATIC',
      paymentMethod: 'blockchain',
      transactionHash,
      contributorWallet, // ✅ INCLUDE IN REQUEST
      metadata: {
        anonymous: metadata?.anonymous || false,
        notes: metadata?.notes
      }
    });

    return contribution;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to record contribution'
    };
  }
}

  /**
   * ✅ FIXED: Confirm contribution with correct endpoint
   */
  async confirmContribution(
    contributionId: string,
    data: ConfirmContributionDto
  ): Promise<ApiResponse<Contribution>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.patch<Contribution>(
        `/contributions/${contributionId}/confirm`, 
        data
      );
      return {
        success: true,
        data: response.data,
        message: 'Contribution confirmed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to confirm contribution',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ FIXED: Get current user's contributions with correct endpoint
   */
  async getMyContributions(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<ApiResponse<{
    contributions: Contribution[];
    total: number;
    page: number;
    pages: number;
    totalMatic: number;
  }>> {
    try {
      const params: any = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (status) params.status = status;

      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get('/contributions/my-contributions', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch contributions',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ FIXED: Get current user's contribution statistics with correct endpoint
   */
  async getMyStats(): Promise<ApiResponse<ContributionStats>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get<ContributionStats>('/contributions/my-stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch statistics',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get a single contribution by ID
   */
  async getContribution(contributionId: string): Promise<ApiResponse<Contribution>> {
    try {
      const response = await this.api.get<Contribution>(`/contributions/${contributionId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch contribution',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ FIXED: Get contributions for a specific project with correct endpoint
   */
  async getProjectContributions(projectId: string): Promise<ApiResponse<ProjectContributions>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get<ProjectContributions>(
        `/contributions/project/${projectId}/contributions`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch project contributions',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ FIXED: Get platform-wide statistics with correct endpoint
   */
  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get<PlatformStats>('/contributions/stats/platform');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch platform statistics',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ FIXED: Verify a Polygon transaction with correct endpoint
   */
  async verifyTransaction(txHash: string): Promise<ApiResponse<{
    transactionHash: string;
    network: string;
    chainId: number;
    polygonscanLink: string;
    message: string;
    status: 'success' | 'pending' | 'failed';
    blockNumber?: number;
    confirmations?: number;
  }>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get(`/contributions/polygon/verify-transaction/${txHash}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify transaction',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ ADDED: Get network information
   */
  async getNetworkInfo(): Promise<ApiResponse<NetworkInfo>> {
    try {
      // ✅ CORRECT ENDPOINT: Based on backend logs
      const response = await this.api.get('/contributions/polygon/network-info');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch network info',
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * ✅ ADDED: Test API connectivity
   */
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    try {
      const response = await this.api.get('/health');
      return {
        success: true,
        data: {
          message: 'Contribution API connected successfully',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Contribution API connection failed'
      };
    }
  }

  // ============= HELPER METHODS =============

  /**
   * Format amount for display
   */
  formatAmount(amount: number): string {
    return `${amount.toFixed(4)} MATIC`;
  }

  /**
   * Format amount with compact notation for large numbers
   */
  formatAmountCompact(amount: number): string {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K MATIC`;
    }
    return this.formatAmount(amount);
  }

  /**
   * Get contribution status badge color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'yellow',
      confirmed: 'green',
      failed: 'red',
    };
    return colors[status] || 'gray';
  }

  /**
   * Get contribution status display text
   */
  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      failed: 'Failed',
    };
    return texts[status] || status;
  }

  /**
   * Calculate total from contributions
   */
  calculateTotalMatic(contributions: Contribution[]): number {
    return contributions.reduce((sum, contribution) => sum + contribution.amountMatic, 0);
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(current: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  }

  /**
   * Open Polygonscan for transaction
   */
  openPolygonscan(txHash: string): void {
    if (typeof window !== 'undefined') {
      const baseUrl = BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.explorerUrl;
      window.open(`${baseUrl}/tx/${txHash}`, '_blank');
    }
  }

  /**
   * Open Polygonscan for address
   */
  openAddressOnPolygonscan(address: string): void {
    if (typeof window !== 'undefined') {
      const baseUrl = BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.explorerUrl;
      window.open(`${baseUrl}/address/${address}`, '_blank');
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return BLOCKCHAIN_CONSTANTS.CONTRACT_ADDRESS;
  }

  /**
   * ✅ ADDED: Check if user has contributed to a project
   */
  async hasUserContributed(projectId: string): Promise<ApiResponse<{ hasContributed: boolean; contributions?: Contribution[] }>> {
    try {
      const myContributions = await this.getMyContributions(1, 100);
      if (!myContributions.success) {
        return {
          success: false,
          error: myContributions.error
        };
      }

      const projectContributions = myContributions.data?.contributions.filter(
        contribution => contribution.project._id === projectId
      ) || [];

      return {
        success: true,
        data: {
          hasContributed: projectContributions.length > 0,
          contributions: projectContributions
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check contribution status'
      };
    }
  }

  /**
   * ✅ ADDED: Get current network configuration
   */
  getCurrentNetwork(): NetworkInfo {
    return {
      chainId: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.chainId,
      chainName: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.chainName,
      rpcUrl: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.rpcUrl,
      explorerUrl: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.explorerUrl,
      nativeCurrency: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.nativeCurrency,
      isTestnet: BLOCKCHAIN_CONSTANTS.POLYGON_MAINNET.isTestnet,
    };
  }
}

// ============= EXPORT SINGLETON INSTANCE =============

const contributionApi = new ContributionApiClient();

export default contributionApi;
export { ContributionApiClient };