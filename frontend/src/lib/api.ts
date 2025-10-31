import axios from "axios";

// lib/api.ts

// Smart base URL configuration
const getBaseURL = () => {
  // Server-side: use the URL from environment variables
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://rootrise.onrender.com/api/v1';
  }
  
  // Client-side logic:
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Development: Use direct localhost connection (from your .env)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  } else {
    // Production: Use proxy to avoid CORS between Vercel and Render
    return '/api/backend';
  }
};

const API_BASE_URL = getBaseURL();

// Enhanced logging with environment info
if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
  console.log('🔧 API Configuration:');
  console.log('   - Environment:', process.env.NODE_ENV);
  console.log('   - Base URL:', API_BASE_URL);
  console.log('   - Using:', typeof window === 'undefined' ? 'Server-side' : 'Client-side');
}

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        environment: process.env.NODE_ENV
      });
    }
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors and CORS issues
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('✅ API Response Success:', {
        url: response.config.url,
        status: response.status,
        environment: process.env.NODE_ENV
      });
    }
    return response;
  },
  (error: unknown) => {
    const axiosError = error as { 
      config?: { url?: string; baseURL?: string }; 
      response?: { status?: number }; 
      message?: string;
      code?: string;
    };
    
    const errorDetails = {
      url: axiosError.config?.url,
      status: axiosError.response?.status,
      message: axiosError.message,
      environment: process.env.NODE_ENV,
      baseURL: axiosError.config?.baseURL
    };
    
    console.error('❌ API Response Error:', errorDetails);
    
    // Handle CORS and network errors specifically
    if (axiosError.code === 'NETWORK_ERROR' || axiosError.message?.includes('Network Error')) {
      console.error('🌐 Network/CORS error detected - check if backend is running');
    }
    
    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
      console.error('🔐 Auth error - clearing token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth_user');
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    // Handle CORS preflight issues
    if (axiosError.response?.status === 0) {
      console.error('🚫 CORS preflight blocked - using proxy in production should fix this');
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

export interface WalletUpdateResponse {
  success: boolean;
  message: string;
  walletAddress: string;
  user?: unknown;
}

class ApiService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate passwords match before sending to server
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    // Remove confirmPassword before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async syncWallet(walletAddress: string): Promise<WalletUpdateResponse> {
    const response = await apiClient.patch<WalletUpdateResponse>('/auth/update-wallet', { 
      walletAddress 
    });
    return response.data;
  }

  // Alias for syncWallet - same functionality
  async updateWalletAddress(walletAddress: string): Promise<WalletUpdateResponse> {
    return this.syncWallet(walletAddress);
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

  // Health check method to test connection
  async healthCheck(): Promise<{ status: string; timestamp: string; environment?: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  }
}

export const api = new ApiService();

// Export the axios instance for direct use if needed
export { apiClient };

// Export default instance
export default api;