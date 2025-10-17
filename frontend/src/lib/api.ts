import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Auth error - clearing token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth_user');
      }
    }
    return Promise.reject(error);
  }
);

// Enums to match backend
export enum UserRole {
  FARMER = 'FARMER',
  INVESTOR = 'INVESTOR',
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL'
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

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  termsAccepted: boolean;
  location?: string;
  bio?: string;
  walletAddress?: string;
  mobileMoneyAccount?: string;
  department?: GovernmentDepartment;
  specializations?: ProjectCategory[];
  confirmPassword?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    _id?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roles?: string[];
    emailVerified: boolean;
    walletAddress?: string;
    phoneNumber?: string;
    lastLogin?: string;
    location?: string;
    bio?: string;
    isGovernmentOfficial?: boolean;
    department?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  message: string;
}

export interface ProfileResponse {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: string[];
  emailVerified: boolean;
  walletAddress?: string;
  phoneNumber?: string;
  lastLogin?: string;
  location?: string;
  bio?: string;
  isGovernmentOfficial: boolean;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
  // Government official stats
  currentWorkload?: number;
  maxWorkload?: number;
  projectsReviewed?: number;
  projectsApproved?: number;
  averageProcessingTime?: number;
  specializations?: ProjectCategory[];
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}

class ApiService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registerData } = data;
    const response = await apiClient.post<AuthResponse>('/auth/register', registerData);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async getProfile(token?: string): Promise<ProfileResponse> {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await apiClient.get<ProfileResponse>('/auth/profile', config);
    return response.data;
  }

  async verifyEmail(verificationToken: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/verify-email', { token: verificationToken });
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  }

  async syncWallet(walletAddress: string): Promise<{ 
    success: boolean; 
    message: string; 
    walletAddress: string 
  }> {
    const response = await apiClient.post('/auth/update-wallet', { 
      walletAddress 
    });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  }

  async verifyToken(): Promise<{ 
    valid: boolean; 
    user: { 
      id: string; 
      _id: string; 
      role: string; 
      roles: string[]; 
      walletAddress?: string; 
      emailVerified: boolean; 
      isGovernmentOfficial: boolean; 
    } 
  }> {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.verifyToken();
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  async isGovernmentOfficial(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      return profile.role === UserRole.GOVERNMENT_OFFICIAL || 
             (profile.roles && profile.roles.includes(UserRole.GOVERNMENT_OFFICIAL)) ||
             profile.isGovernmentOfficial === true;
    } catch (error) {
      console.error('Government role check failed:', error);
      return false;
    }
  }

  // Government official specific methods
  async getAvailableOfficials(department?: GovernmentDepartment, specialization?: ProjectCategory): Promise<ProfileResponse[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (specialization) params.append('specialization', specialization);
    
    const response = await apiClient.get<ProfileResponse[]>(`/users/officials/available?${params}`);
    return response.data;
  }
}

export const api = new ApiService();