import { AxiosInstance } from "axios";
import { apiClient } from "./api";

// lib/projectApi.ts

// ==================== TYPES & INTERFACES ====================

export enum UserRole {
  FARMER = 'FARMER', 
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL', 
  CONTRIBUTOR = 'CONTRIBUTOR',
  INVESTOR = 'INVESTOR',
}

export enum ProjectStatus {
  SUBMITTED = 'submitted', 
  UNDER_REVIEW = 'under_review',
  ACTIVE = 'active',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  FUNDED = 'funded',
  CLOSED = 'closed',
}

export enum GovernmentDepartment {
  POULTRY = 'POULTRY',
  CROPS = 'CROPS',
  LIVESTOCK = 'LIVESTOCK',
  FISHERIES = 'FISHERIES',
  HORTICULTURE = 'HORTICULTURE',
  AGRIBUSINESS = 'AGRIBUSINESS',
  SUSTAINABILITY = 'SUSTAINABILITY',
  COMPLIANCE = 'COMPLIANCE',
  GENERAL = 'GENERAL'
}

export enum ProjectCategory {
  POULTRY_FARMING = 'POULTRY_FARMING',
  CROP_PRODUCTION = 'CROP_PRODUCTION',
  LIVESTOCK_FARMING = 'LIVESTOCK_FARMING',
  FISH_FARMING = 'FISH_FARMING',
  VEGETABLE_FARMING = 'VEGETABLE_FARMING',
  FRUIT_FARMING = 'FRUIT_FARMING',
  AGRO_PROCESSING = 'AGRO_PROCESSING',
  SUSTAINABLE_AGRICULTURE = 'SUSTAINABLE_AGRICULTURE',
  ORGANIC_FARMING = 'ORGANIC_FARMING',
  GENERAL_AGRICULTURE = 'GENERAL_AGRICULTURE'
}

export interface ProjectDocument {
  name: string;
  url: string;
  documentType?: string;
  uploadedAt?: Date | string;
}

export interface DueDiligenceDocument {
  name: string;
  url: string;
  uploadedAt: Date | string;
}

export interface User {
  walletAddress?: string;
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  profileImage?: string;
  department?: GovernmentDepartment;
  role?: UserRole;
}

export interface DueDiligence {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: User;
  startedAt?: Date;
  completedAt?: Date;
  notes: string;
  documents: DueDiligenceDocument[];
}

export interface Verification {
  verifiedBy?: User;
  verifiedAt?: Date;
  documentHash?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Project {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  category: string; 
  fundingGoal: number;
  fundingGoalMatic?: number;
  currentFunding: number;
  currentFundingMatic?: number;
  currency?: string;
  timeline: string;
  location: string;
  images: string[];
  documents: ProjectDocument[];
  farmer: User | string;
  status: ProjectStatus;
  contributorsCount: number;
  dueDiligence: DueDiligence; 
  verification: Verification; 
  createdAt: Date;
  updatedAt: Date;
  department?: GovernmentDepartment;
  submittedAt?: Date;
  
  // Blockchain fields
  blockchainProjectId?: number;
  blockchainStatus?: 'not_created' | 'pending' | 'created' | 'failed';
  blockchainTxHash?: string;
  blockchainCreatedAt?: Date;
  isBlockchainFunded?: boolean;
  blockchainFundedAt?: Date;
  farmerWalletAddress?: string;

  // Virtual fields from backend
  fundingProgress?: number;
  fundingGoalFormatted?: string;
  currentFundingFormatted?: string;
}

export interface DepartmentProjectsResponse {
  department: GovernmentDepartment;
  totalProjects: number;
  projects: Project[];
  message: string;
}

export interface DepartmentRecommendations {
  recommendedDepartment: GovernmentDepartment;
  projectCategory: ProjectCategory;
  message: string;
  departmentOfficials: User[]; 
}

// New interfaces based on backend analysis
export interface GovernmentDashboard {
  totalProjects: number;
  pendingReview: number;
  verifiedProjects: number;
  departmentBreakdown: Array<{
    department: GovernmentDepartment;
    count: number;
  }>;
  recentActivity: unknown[];
  totalFunding: number;
  activeProjects: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  fundedProjects: number;
  totalFunding: number;
  totalContributors: number;
  successRate: number;
  pendingReview: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
  departmentStats?: Array<{
    department: GovernmentDepartment;
    count: number;
    funding: number;
  }>;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  timeline: string;
  location: string;
  images?: string[];
  documents?: ProjectDocument[];
  farmerWalletAddress: string; 
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  category?: string;
  fundingGoal?: number;
  timeline?: string;
  location?: string;
  images?: string[];
  documents?: ProjectDocument[];
}

export interface UpdateDueDiligenceDto {
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  documents?: DueDiligenceDocument[];
}

export interface VerifyProjectDto {
  notes?: string;
}

export interface RejectProjectDto {
  reason: string;
}

export interface PlatformStats {
  totalProjects: number;
  activeProjects: number;
  fundedProjects: number;
  totalFunding: number;
  totalFundingMatic?: number;
  totalFundingFormatted?: string;
  pendingReview: number;
  rejectedProjects: number;
  averageProcessingTime: string;
  currency?: string;
  totalContributors?: number;
  successRate?: number;
}

export interface UploadResponse {
  message: string;
  url: string;
  publicId: string;
  name?: string;
}

export interface MultiUploadResponse {
  message: string;
  urls: string[];
  count: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface BlockchainProjectStatus {
  blockchainEnabled: boolean;
  projectId?: number;
  isCompleted?: boolean;
  isFunded?: boolean;
  totalFunding?: number;
  fundingGoal?: number;
  canComplete?: boolean;
  localFunding?: number;
  localStatus?: ProjectStatus;
  message?: string;
  error?: string;
  currency?: string;
  network?: string;
  chainId?: number;
}

export interface BlockchainCompletionResponse {
  txHash: string;
}

export interface CreateProjectResponse extends Project {
  categorization?: {
    recommendedDepartment?: GovernmentDepartment;
    confidence?: number;
    message?: string;
  };
  message: string;
}

export interface DebugProjectInfo {
  id: string;
  title: string;
  status: string;
  farmer: User | string;
  farmerId: string;
  farmerWallet: string;
  createdAt: string;
}

// ==================== API CLIENT ====================

class ProjectApiClient {
  private api: AxiosInstance;

  constructor() {
    // Use the shared apiClient from your main api.ts file
    // This ensures consistent base URL, interceptors, and error handling
    this.api = apiClient;
  }

  // ==================== FARMER ENDPOINTS ====================

  async createProject(data: CreateProjectDto): Promise<CreateProjectResponse> {
    const response = await this.api.post<CreateProjectResponse>('/projects', data);
    return response.data;
  }

  async getMyProjects(status?: string): Promise<Project[]> {
    const params = status ? { status } : {};
    const response = await this.api.get<Project[]>('/projects/my-projects', { params });
    return response.data;
  }

  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await this.api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/projects/${id}`);
    return response.data;
  }

  // ==================== GOVERNMENT ENDPOINTS ====================

  async getAllProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects');
    return response.data;
  }

  async getAllProjectsForGovernment(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/government/dashboard');
    return response.data;
  }

  async getProjectsByDepartment(department: GovernmentDepartment): Promise<DepartmentProjectsResponse> {
    const response = await this.api.get<DepartmentProjectsResponse>(`/projects/department/${department}`);
    return response.data;
  }

  async getMyDepartmentProjects(): Promise<DepartmentProjectsResponse> {
    const response = await this.api.get<DepartmentProjectsResponse>('/projects/my-department');
    return response.data;
  }

  async getDepartmentRecommendations(category: ProjectCategory): Promise<DepartmentRecommendations> {
    const response = await this.api.get<DepartmentRecommendations>(`/projects/department-recommendations/${category}`);
    return response.data;
  }

  async getPendingProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/pending/review');
    return response.data;
  }

  async updateDueDiligence(projectId: string, data: UpdateDueDiligenceDto): Promise<Project> {
    const response = await this.api.patch<Project>(
      `/projects/${projectId}/due-diligence`,
      data
    );
    return response.data;
  }

  async verifyProject(projectId: string, notes?: string): Promise<Project> {
    const response = await this.api.post<Project>(`/projects/${projectId}/verify`, {
      notes,
    });
    return response.data;
  }

  async rejectProject(projectId: string, reason: string): Promise<Project> {
    const response = await this.api.post<Project>(`/projects/${projectId}/reject`, {
      reason,
    });
    return response.data;
  }

  // ==================== CONTRIBUTOR ENDPOINTS ====================

  async getVerifiedProjects(category?: string, location?: string): Promise<Project[]> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (location) params.location = location;

    const response = await this.api.get<Project[]>('/projects/verified/list', {
      params,
    });
    return response.data;
  }

  async addToFavorites(projectId: string): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(
      `/projects/${projectId}/favorite`
    );
    return response.data;
  }

  async removeFromFavorites(projectId: string): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(
      `/projects/${projectId}/favorite`
    );
    return response.data;
  }

  async getFavorites(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/favorites');
    return response.data;
  }

  async isFavorite(projectId: string): Promise<{ isFavorite: boolean }> {
    const response = await this.api.get<{ isFavorite: boolean }>(
      `/projects/${projectId}/is-favorite`
    );
    return response.data;
  }

  // ==================== SHARED ENDPOINTS ====================

  async getProjectById(id: string): Promise<Project> {
    const response = await this.api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const response = await this.api.get<PlatformStats>('/projects/stats/dashboard');
    return response.data;
  }

  //  Get government-specific dashboard stats
  async getGovernmentDashboardStats(): Promise<GovernmentDashboard> {
    const response = await this.api.get<GovernmentDashboard>('/projects/government/dashboard');
    return response.data;
  }

  //  Get detailed project statistics
  async getProjectStatistics(): Promise<ProjectStats> {
    const response = await this.api.get<ProjectStats>('/projects/stats/dashboard');
    return response.data;
  }

  // ==================== UPLOAD ENDPOINTS ====================

  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadMultipleImages(files: File[]): Promise<MultiUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.api.post<MultiUploadResponse>(
      '/upload/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<UploadResponse>('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // ==================== DEBUG & TESTING ENDPOINTS ====================

  async debugUserInfo(): Promise<{
    user: User;
    permissions: string[];
    department?: GovernmentDepartment;
  }> {
    const response = await this.api.get('/projects/debug/user-info');
    return response.data;
  }

  async debugAllProjects(): Promise<DebugProjectInfo[]> {
    const response = await this.api.get<DebugProjectInfo[]>('/projects/debug/all');
    return response.data;
  }

  // Test API connectivity
  async testConnection(): Promise<{ success: boolean; message: string; timestamp?: string }> {
    try {
      await this.api.get('/health');
      return {
        success: true,
        message: 'API connection successful',
        timestamp: new Date().toISOString()
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API connection failed';
      return {
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== BLOCKCHAIN METHODS ====================

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem('authToken');
    } catch {
      return false;
    }
  }

  async getBlockchainStatus(projectId: string): Promise<BlockchainProjectStatus> {
    const response = await this.api.get<BlockchainProjectStatus>(
      `/projects/${projectId}/blockchain-status`
    );
    return response.data;
  }

  /**
   * Get project with blockchain status check
   */
  async getProjectWithBlockchainStatus(id: string): Promise<{
    project: Project;
    blockchainEnabled: boolean;
    blockchainInfo?: BlockchainProjectStatus;
    message?: string;
  }> {
    try {
      const project = await this.getProjectById(id);
      const blockchainStatus = await this.getBlockchainStatus(id);
      
      return {
        project,
        blockchainEnabled: blockchainStatus.blockchainEnabled,
        blockchainInfo: blockchainStatus.blockchainEnabled ? blockchainStatus : undefined,
        message: blockchainStatus.message
      };
    } catch {
      const project = await this.getProjectById(id);
      return {
        project,
        blockchainEnabled: false,
        message: 'Blockchain data unavailable'
      };
    }
  }

  /**
   * Check if project is ready for contributions
   */
  async isProjectReadyForContributions(projectId: string): Promise<{
    ready: boolean;
    reason?: string;
    project?: Project;
    blockchainInfo?: BlockchainProjectStatus;
  }> {
    try {
      const { project, blockchainEnabled, blockchainInfo } = await this.getProjectWithBlockchainStatus(projectId);
      
      if (project.status !== 'active' && project.status !== 'verified') {
        return { 
          ready: false, 
          reason: `Project is ${project.status}. Only active projects can receive contributions.`,
          project
        };
      }
      
      if (!blockchainEnabled) {
        return { 
          ready: false, 
          reason: 'Blockchain integration not available for this project.',
          project
        };
      }
      
      if (!project.blockchainProjectId && project.blockchainProjectId !== 0) {
        return { 
          ready: false, 
          reason: 'Project not yet deployed to blockchain. Please try again later.',
          project
        };
      }
      
      if (project.blockchainStatus !== 'created') {
        return { 
          ready: false, 
          reason: `Blockchain deployment status: ${project.blockchainStatus}. Please wait for deployment to complete.`,
          project
        };
      }
      
      if (blockchainInfo?.isFunded) {
        return { 
          ready: false, 
          reason: 'Project is already fully funded on blockchain.',
          project,
          blockchainInfo
        };
      }
      
      return { 
        ready: true, 
        project,
        blockchainInfo
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check project status';
      return { 
        ready: false, 
        reason: errorMessage 
      };
    }
  }

  /**
   * Get funding progress with blockchain data
   */
  async getFundingProgress(projectId: string): Promise<{
    currentFunding: number;
    fundingGoal: number;
    progressPercentage: number;
    blockchainFunding?: number;
    isFullyFunded: boolean;
    currency: string;
    message?: string;
  }> {
    try {
      const { project, blockchainInfo } = await this.getProjectWithBlockchainStatus(projectId);
      
      const currentFunding = blockchainInfo?.totalFunding || project.currentFunding;
      const fundingGoal = blockchainInfo?.fundingGoal || project.fundingGoal;
      const progressPercentage = fundingGoal > 0 ? (currentFunding / fundingGoal) * 100 : 0;
      
      return {
        currentFunding,
        fundingGoal,
        progressPercentage,
        blockchainFunding: blockchainInfo?.totalFunding,
        isFullyFunded: progressPercentage >= 100,
        currency: 'MATIC',
        message: blockchainInfo?.message
      };
    } catch {
      const project = await this.getProjectById(projectId);
      const progressPercentage = project.fundingGoal > 0 ? (project.currentFunding / project.fundingGoal) * 100 : 0;
      
      return {
        currentFunding: project.currentFunding,
        fundingGoal: project.fundingGoal,
        progressPercentage,
        isFullyFunded: progressPercentage >= 100,
        currency: 'MATIC',
        message: 'Using local data only - blockchain unavailable'
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format MATIC amount with currency
   */
  formatMaticAmount(amount: number): string {
    return `${amount} MATIC`;
  }

  /**
   * Validate wallet address format
   */
  isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get project status color for UI
   */
  getStatusColor(status: ProjectStatus): string {
    const statusColors = {
      [ProjectStatus.SUBMITTED]: 'blue',
      [ProjectStatus.UNDER_REVIEW]: 'orange', 
      [ProjectStatus.ACTIVE]: 'green',
      [ProjectStatus.VERIFIED]: 'green',
      [ProjectStatus.REJECTED]: 'red',
      [ProjectStatus.FUNDED]: 'purple',
      [ProjectStatus.CLOSED]: 'gray'
    };
    return statusColors[status] || 'gray';
  }

  /**
   * Get project status text for UI
   */
  getStatusText(status: ProjectStatus): string {
    const statusTexts = {
      [ProjectStatus.SUBMITTED]: 'Submitted',
      [ProjectStatus.UNDER_REVIEW]: 'Under Review',
      [ProjectStatus.ACTIVE]: 'Active',
      [ProjectStatus.VERIFIED]: 'Verified', 
      [ProjectStatus.REJECTED]: 'Rejected',
      [ProjectStatus.FUNDED]: 'Funded',
      [ProjectStatus.CLOSED]: 'Closed'
    };
    return statusTexts[status] || status;
  }

  /**
   * Get department display name
   */
  getDepartmentDisplayName(department: GovernmentDepartment): string {
    const departmentNames = {
      [GovernmentDepartment.POULTRY]: 'Poultry',
      [GovernmentDepartment.CROPS]: 'Crops',
      [GovernmentDepartment.LIVESTOCK]: 'Livestock',
      [GovernmentDepartment.FISHERIES]: 'Fisheries',
      [GovernmentDepartment.HORTICULTURE]: 'Horticulture',
      [GovernmentDepartment.AGRIBUSINESS]: 'Agribusiness',
      [GovernmentDepartment.SUSTAINABILITY]: 'Sustainability',
      [GovernmentDepartment.COMPLIANCE]: 'Compliance',
      [GovernmentDepartment.GENERAL]: 'General Agriculture'
    };
    return departmentNames[department] || department;
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: ProjectCategory): string {
    const categoryNames = {
      [ProjectCategory.POULTRY_FARMING]: 'Poultry Farming',
      [ProjectCategory.CROP_PRODUCTION]: 'Crop Production',
      [ProjectCategory.LIVESTOCK_FARMING]: 'Livestock Farming',
      [ProjectCategory.FISH_FARMING]: 'Fish Farming',
      [ProjectCategory.VEGETABLE_FARMING]: 'Vegetable Farming',
      [ProjectCategory.FRUIT_FARMING]: 'Fruit Farming',
      [ProjectCategory.AGRO_PROCESSING]: 'Agro Processing',
      [ProjectCategory.SUSTAINABLE_AGRICULTURE]: 'Sustainable Agriculture',
      [ProjectCategory.ORGANIC_FARMING]: 'Organic Farming',
      [ProjectCategory.GENERAL_AGRICULTURE]: 'General Agriculture'
    };
    return categoryNames[category] || category;
  }

  // ==================== DEPRECATED METHODS ====================

  /**
   * @deprecated Use getProjectWithBlockchainStatus instead
   */
  async completeProjectOnBlockchain(projectId: string): Promise<BlockchainCompletionResponse> {
    console.warn('completeProjectOnBlockchain is deprecated - projects complete automatically when funded');
    const response = await this.api.post<BlockchainCompletionResponse>(
      `/projects/${projectId}/complete-blockchain`
    );
    return response.data;
  }

  /**
   * @deprecated Use getBlockchainStatus instead
   */
  async checkAndUpdateProjectCompletion(projectId: string): Promise<Project> {
    console.warn('checkAndUpdateProjectCompletion is deprecated - use getBlockchainStatus');
    const response = await this.api.post<Project>(
      `/projects/${projectId}/check-completion`
    );
    return response.data;
  }

  /**
   * @deprecated Blockchain sync happens automatically
   */
  async syncBlockchainStatus(projectId: string): Promise<{ message: string }> {
    console.warn('syncBlockchainStatus is deprecated - blockchain sync happens automatically');
    const response = await this.api.post<{ message: string }>(
      `/projects/${projectId}/sync-blockchain`
    );
    return response.data;
  }

  /**
   * @deprecated Use createProject instead - blockchain creation is automatic
   */
  async createProjectWithBlockchain(data: CreateProjectDto): Promise<Project & { blockchainStatus: string }> {
    console.warn('createProjectWithBlockchain is deprecated - use createProject, blockchain creation is automatic');
    const response = await this.api.post<Project & { blockchainStatus: string }>('/projects', data);
    return response.data;
  }
}

// ==================== UTILITY TYPES ====================

export interface ProjectWithBlockchain extends Project {
  blockchainProjectId: number;
  blockchainStatus: 'not_created' | 'pending' | 'created' | 'failed';
  blockchainTxHash?: string;
  blockchainCreatedAt?: Date;
  isBlockchainFunded?: boolean;
  blockchainFundedAt?: Date;
}

export interface BlockchainTransaction {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: Date;
  gasUsed?: number;
}

export interface FundingProgress {
  currentFunding: number;
  fundingGoal: number;
  progressPercentage: number;
  blockchainFunding?: number;
  isFullyFunded: boolean;
  currency: string;
}

export const projectApi = new ProjectApiClient();

export default ProjectApiClient;