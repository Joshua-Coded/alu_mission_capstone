import axios, { AxiosError, AxiosInstance } from "axios";

// ==================== TYPES & INTERFACES ====================

export enum UserRole {
  FARMER = 'FARMER', 
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL', 
  CONTRIBUTOR = 'CONTRIBUTOR',
}

export enum ProjectStatus {
  SUBMITTED = 'submitted', 
  UNDER_REVIEW = 'under_review',
  ACTIVE = 'active',
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

// ✅ PROPER DOCUMENT TYPES
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
  status: 'pending' | 'in_progress' | 'completed';
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
}

export interface Project {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  category: string; 
  fundingGoal: number;
  currentFunding: number;
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
  departmentOfficials: any[];
}

export interface CreateProjectDto {
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  timeline: string;
  location: string;
  images: string[];
  documents: ProjectDocument[];
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
  pendingReview: number;
  rejectedProjects: number;
  averageProcessingTime: string;
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
  totalFunding?: string;
  fundingGoal?: string;
  canComplete?: boolean;
  localFunding?: number;
  localStatus?: ProjectStatus;
  message?: string;
  error?: string;
}

export interface BlockchainCompletionResponse {
  txHash: string;
}

// ==================== API CLIENT ====================

class ProjectApiClient {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
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
      (response) => {
        return response;
      },
      (error: AxiosError<ApiError>) => {
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          return Promise.reject(new Error('Unable to connect to server. Please check if the API server is running.'));
        }
        
        if (error.response?.status === 401) {
          this.clearToken();
        }

        const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // ==================== FARMER ENDPOINTS ====================

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await this.api.post<Project>('/projects', data);
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
    const params: any = {};
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

  // ==================== DEBUG ENDPOINTS ====================

  async debugUserInfo(): Promise<any> {
    const response = await this.api.get('/projects/debug/user-info');
    return response.data;
  }

  // ==================== BLOCKCHAIN METHODS ====================

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getBlockchainStatus(projectId: string): Promise<BlockchainProjectStatus> {
    const response = await this.api.get<BlockchainProjectStatus>(
      `/projects/${projectId}/blockchain-status`
    );
    return response.data;
  }

  async completeProjectOnBlockchain(projectId: string): Promise<BlockchainCompletionResponse> {
    const response = await this.api.post<BlockchainCompletionResponse>(
      `/projects/${projectId}/complete-blockchain`
    );
    return response.data;
  }

  async checkAndUpdateProjectCompletion(projectId: string): Promise<Project> {
    const response = await this.api.post<Project>(
      `/projects/${projectId}/check-completion`
    );
    return response.data;
  }

  async syncBlockchainStatus(projectId: string): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(
      `/projects/${projectId}/sync-blockchain`
    );
    return response.data;
  }

  async createProjectWithBlockchain(data: CreateProjectDto): Promise<Project & { blockchainStatus: string }> {
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
  blockchainFunding?: string;
  isFullyFunded: boolean;
}

// Export singleton instance
export const projectApi = new ProjectApiClient();

export default ProjectApiClient;