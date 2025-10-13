import axios, { AxiosError, AxiosInstance } from "axios";

// api/projectApi.ts

// ==================== TYPES & INTERFACES ====================

export enum UserRole {
  FARMER = 'farmer',
  GOVERNMENT = 'government',
  CONTRIBUTOR = 'contributor',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  FUNDED = 'funded',
  CLOSED = 'closed',
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  profileImage?: string;
}

export interface DueDiligence {
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: User;
  startedAt?: Date;
  completedAt?: Date;
  notes: string;
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
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
  documents: Array<{
    name: string;
    url: string;
  }>;
  farmer: User | string;
  status: ProjectStatus;
  contributorsCount: number;
  dueDiligence: DueDiligence;
  verification: Verification;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  timeline: string;
  location: string;
  images: string[];
  documents: Array<{
    name: string;
    url: string;
  }>;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  category?: string;
  fundingGoal?: number;
  timeline?: string;
  location?: string;
  images?: string[];
  documents?: Array<{
    name: string;
    url: string;
  }>;
}

export interface UpdateDueDiligenceDto {
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  documents?: Array<{
    name: string;
    url: string;
  }>;
}

export interface PlatformStats {
  totalProjects: number;
  activeProjects: number;
  fundedProjects: number;
  totalFunding: number;
  pendingReview: number;
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

// ==================== API CLIENT ====================

class ProjectApiClient {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for better error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          console.error('Network error - API server may be down');
          return Promise.reject(new Error('Unable to connect to server. Please check if the API server is running.'));
        }
        
        const errorMessage = error.response?.data?.message || error.message;
        console.error('API Error:', errorMessage);
        
        // Handle specific HTTP status codes
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  clearToken(): void {
    localStorage.removeItem('authToken');
  }

  // ==================== FARMER ENDPOINTS ====================

  // Create a new project
  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await this.api.post<Project>('/projects', data);
    return response.data;
  }

  // Get farmer's projects
  async getMyProjects(status?: ProjectStatus): Promise<Project[]> {
    const params = status ? { status } : {};
    const response = await this.api.get<Project[]>('/projects/my-projects', { params });
    return response.data;
  }

  // Update project (draft/submitted only)
  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await this.api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  }

  // Delete project (draft only)
  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/projects/${id}`);
    return response.data;
  }

  // Submit project for review
  async submitProject(id: string): Promise<Project> {
    const response = await this.api.post<Project>(`/projects/${id}/submit`);
    return response.data;
  }

  // ==================== GOVERNMENT ENDPOINTS ====================

  // Get projects pending review
  async getPendingProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/pending/review');
    return response.data;
  }

  // Get assigned projects
  async getMyAssignedProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/my-assigned');
    return response.data;
  }

  // Assign project for due diligence
  async assignDueDiligence(
    projectId: string,
    governmentOfficialId: string
  ): Promise<Project> {
    const response = await this.api.post<Project>(`/projects/${projectId}/assign`, {
      governmentOfficialId,
    });
    return response.data;
  }

  // Update due diligence
  async updateDueDiligence(
    projectId: string,
    data: UpdateDueDiligenceDto
  ): Promise<Project> {
    const response = await this.api.patch<Project>(
      `/projects/${projectId}/due-diligence`,
      data
    );
    return response.data;
  }

  // Verify project
  async verifyProject(projectId: string, notes?: string): Promise<Project> {
    const response = await this.api.post<Project>(`/projects/${projectId}/verify`, {
      notes,
    });
    return response.data;
  }

  // Reject project
  async rejectProject(projectId: string, reason: string): Promise<Project> {
    const response = await this.api.post<Project>(`/projects/${projectId}/reject`, {
      reason,
    });
    return response.data;
  }

  // ==================== CONTRIBUTOR ENDPOINTS ====================

  // Get verified/active projects
  async getVerifiedProjects(category?: string, location?: string): Promise<Project[]> {
    const params: any = {};
    if (category) params.category = category;
    if (location) params.location = location;

    const response = await this.api.get<Project[]>('/projects/verified/list', {
      params,
    });
    return response.data;
  }

  // Add project to favorites
  async addToFavorites(projectId: string): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(
      `/projects/${projectId}/favorite`
    );
    return response.data;
  }

  // Remove project from favorites
  async removeFromFavorites(projectId: string): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(
      `/projects/${projectId}/favorite`
    );
    return response.data;
  }

  // Get favorite projects
  async getFavorites(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/favorites');
    return response.data;
  }

  // Check if project is favorited
  async isFavorite(projectId: string): Promise<{ isFavorite: boolean }> {
    const response = await this.api.get<{ isFavorite: boolean }>(
      `/projects/${projectId}/is-favorite`
    );
    return response.data;
  }

  // ==================== SHARED ENDPOINTS ====================

  // Get single project by ID
  async getProjectById(id: string): Promise<Project> {
    const response = await this.api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  // Get platform statistics
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await this.api.get<PlatformStats>('/projects/stats/dashboard');
    return response.data;
  }

  // ==================== UPLOAD ENDPOINTS - FIXED VERSION ====================

  // Upload single image - WITH PROPER VALIDATION
  async uploadImage(file: File): Promise<UploadResponse> {
    // Validate file type before upload - STRICT VALIDATION
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(file.type)) {
      throw new Error('Only image files (JPEG, PNG, WEBP) are allowed');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post<UploadResponse>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for uploads
      });
      return response.data;
    } catch (error: any) {
      console.error('Upload image error:', error);
      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error('Invalid file type or format. Please use JPEG, PNG, or WEBP images only.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please select an image smaller than 5MB.');
      } else {
        throw new Error(error.message || 'Failed to upload image. Please try again.');
      }
    }
  }

  // Upload multiple images - WITH BATCH VALIDATION
  async uploadMultipleImages(files: File[]): Promise<MultiUploadResponse> {
    // Validate all files first
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFiles = 10;
    
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} images allowed per upload`);
    }
    
    for (const file of files) {
      if (!allowedImageTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}. Only JPEG, PNG, WEBP allowed.`);
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File too large: ${file.name}. Maximum size is 5MB.`);
      }
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await this.api.post<MultiUploadResponse>(
        '/upload/images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes for multiple files
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload Progress: ${percentCompleted}%`);
            }
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Upload multiple images error:', error);
      if (error.response?.status === 400) {
        throw new Error('One or more files are invalid. Please check file types and sizes.');
      } else if (error.response?.status === 413) {
        throw new Error('Total file size too large. Please reduce the number or size of files.');
      } else {
        throw new Error(error.message || 'Failed to upload images. Please try again.');
      }
    }
  }

  // Upload document - WITH PROPER VALIDATION
  async uploadDocument(file: File): Promise<UploadResponse> {
    // Validate document types
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedDocTypes.includes(file.type)) {
      throw new Error('Only PDF and Word documents are allowed');
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Document size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post<UploadResponse>('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      return response.data;
    } catch (error: any) {
      console.error('Upload document error:', error);
      if (error.response?.status === 400) {
        throw new Error('Invalid document format. Please use PDF or Word documents only.');
      } else if (error.response?.status === 413) {
        throw new Error('Document too large. Please select a file smaller than 10MB.');
      } else {
        throw new Error(error.message || 'Failed to upload document. Please try again.');
      }
    }
  }

  // ==================== HEALTH CHECK ====================

  // Check if API server is reachable
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.api.get<{ status: string; timestamp: string }>('/health');
      return response.data;
    } catch (error) {
      throw new Error('API server is not reachable. Please check if the backend is running.');
    }
  }

  // ==================== FILE VALIDATION HELPERS ====================

  // Helper to validate image files before upload
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, or WEBP images are allowed' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Image must be smaller than 5MB' };
    }

    return { isValid: true };
  }

  // Helper to validate document files before upload
  validateDocumentFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only PDF and Word documents are allowed' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Document must be smaller than 10MB' };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const projectApi = new ProjectApiClient();

// Export class for custom instances if needed
export default ProjectApiClient;