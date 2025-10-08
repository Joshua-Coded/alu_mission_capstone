// Enhanced Farmer Types for Production Use

export interface FarmerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  walletAddress?: string;
  verified: boolean;
  joinDate: Date;
  location: string;
  farmSize: number;
  experience: number;
  phone?: string;
  profileImage?: string;
  specialization?: string[];
  certifications?: string[];
  languages?: string[];
  farmingMethods?: ('Organic' | 'Conventional' | 'Hydroponic' | 'Vertical' | 'Greenhouse')[];
  cooperativeMember?: boolean;
  mentorAvailable?: boolean;
}

export interface FarmStats {
  totalFunding: number;
  fundingChange: number;
  activeInvestors: number;
  investorsChange: number;
  cropYield: number;
  yieldChange: number;
  roiDelivered: number;
  roiChange: number;
  totalProjects: number;
  completedProjects: number;
  successRate: number;
  averageProjectDuration: number;
  sustainabilityScore?: number;
}

export interface Project {
  // Basic Info
  id: string;
  name: string;
  description: string;
  cropType: string;
  status: 'active' | 'completed' | 'cancelled' | 'funding' | 'pending_verification';
  phase: 'Planning' | 'Planting' | 'Growing' | 'Harvest' | 'Completed';
  
  // Financial
  fundingGoal: number;
  currentFunding: number;
  progress: number;
  investors: number;
  expectedROI: number;
  actualROI?: number;
  
  // Timeline
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  
  // Location & Farm Details
  location: string;
  farmSize: number;
  expectedYield: number;
  actualYield?: number;
  farmerAddress: string;
  contractAddress?: string;
  
  // Enhanced Details
  farmingMethod?: 'Organic' | 'Conventional' | 'Hydroponic' | 'Vertical' | 'Greenhouse' | 'Permaculture';
  seedVariety?: string;
  soilType?: string;
  irrigationType?: 'Drip' | 'Sprinkler' | 'Flood' | 'Rain-fed';
  
  // Media & Documentation
  images?: string[];
  videos?: string[];
  documents?: ProjectDocument[];
  
  // Risk & Sustainability
  riskLevel?: 'Low' | 'Medium' | 'High';
  riskFactors?: string[];
  sustainabilityScore?: number;
  organicCertified?: boolean;
  
  // Market Information
  targetMarket?: string[];
  pricePerKg?: number;
  preOrders?: number;
  distributionChannels?: string[];
  
  // Performance Tracking
  updates: ProjectUpdate[];
  milestones?: ProjectMilestone[];
  weatherData?: WeatherData;
  soilHealth?: SoilHealthData;
  
  // Team & Support
  teamSize?: number;
  advisors?: string[];
  cooperativeSupport?: boolean;
  
  // Compliance
  permits?: string[];
  insurance?: InsuranceInfo;
  
  // Display helpers (for backwards compatibility)
  funding?: string;
  fundingGoalFormatted?: string;
  roi?: string;
  expectedHarvest?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'business_plan' | 'soil_report' | 'certification' | 'contract' | 'permit' | 'insurance' | 'other';
  url: string;
  uploadDate: Date;
  size?: number;
  verified?: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'delayed' | 'cancelled';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed?: number;
  uvIndex?: number;
  lastUpdated: Date;
  forecast?: {
    date: Date;
    temperature: number;
    rainfall: number;
    condition: string;
  }[];
}

export interface SoilHealthData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  lastTested: Date;
  recommendations?: string[];
}

export interface InsuranceInfo {
  provider: string;
  coverage: number;
  premium: number;
  expiryDate: Date;
  claimHistory?: number;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  description: string;
  images?: string[];
  videos?: string[];
  timestamp: Date;
  phase: string;
  author?: string;
  metrics?: {
    growth: number;
    health: number;
    weather: string;
    soilMoisture?: number;
    pestActivity?: string;
    marketPrice?: number;
    waterUsage?: number;
    laborHours?: number;
  };
  tags?: string[];
  publicVisible?: boolean;
  investorOnly?: boolean;
}

export interface Activity {
  id: string;
  type: 'investment' | 'milestone' | 'weather' | 'goal' | 'roi' | 'harvest' | 'update' | 'verification' | 'payout';
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
  projectId?: string;
  investorAddress?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

export interface Investment {
  id: string;
  projectId: string;
  investorAddress: string;
  amount: number;
  timestamp: Date;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  expectedReturns: number;
  actualReturns?: number;
  paymentMethod?: 'crypto' | 'mobile_money' | 'bank_transfer';
  investmentType?: 'equity' | 'revenue_share' | 'fixed_return';
  returnSchedule?: Date[];
  payoutHistory?: PayoutRecord[];
  contractTerms?: string;
}

export interface PayoutRecord {
  id: string;
  investmentId: string;
  amount: number;
  payoutDate: Date;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'dividend' | 'principal' | 'bonus';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface MarketPrice {
  cropType: string;
  location: string;
  price: number;
  currency: string;
  unit: 'kg' | 'ton' | 'bag';
  timestamp: Date;
  source: string;
  trend: 'up' | 'down' | 'stable';
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  timestamp: Date;
  likes: number;
  comments: CommunityComment[];
  category: 'question' | 'tip' | 'success_story' | 'announcement' | 'discussion';
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
  likes: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: Date;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  images?: string[];
  downloads?: number;
  rating?: number;
}

// Utility types for form validation and API responses
export type ProjectStatus = Project['status'];
export type ProjectPhase = Project['phase'];
export type FarmingMethod = NonNullable<Project['farmingMethod']>;
export type IrrigationType = NonNullable<Project['irrigationType']>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search and filter types
export interface ProjectFilters {
  status?: ProjectStatus[];
  cropType?: string[];
  location?: string[];
  farmingMethod?: FarmingMethod[];
  minFunding?: number;
  maxFunding?: number;
  minROI?: number;
  riskLevel?: string[];
  verified?: boolean;
}

export interface SearchParams {
  query?: string;
  filters?: ProjectFilters;
  sortBy?: 'name' | 'fundingGoal' | 'expectedROI' | 'startDate' | 'progress';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Sample data
export const sampleEnhancedProject: Project = {
  id: '1',
  name: 'Organic Heritage Tomatoes 2024',
  description: 'Premium organic heirloom tomatoes using regenerative farming practices with greenhouse technology for year-round production.',
  cropType: 'Heirloom Tomatoes',
  status: 'active',
  phase: 'Growing',
  fundingGoal: 15000,
  currentFunding: 12750,
  progress: 85,
  investors: 23,
  expectedROI: 28,
  startDate: new Date('2024-10-01'),
  expectedEndDate: new Date('2024-12-20'),
  location: 'Kigali Province',
  farmSize: 2.5,
  expectedYield: 8000,
  farmerAddress: '0x123...abc',
  farmingMethod: 'Organic',
  seedVariety: 'Cherokee Purple, Brandywine',
  soilType: 'Sandy Loam',
  irrigationType: 'Drip',
  riskLevel: 'Low',
  riskFactors: ['Weather dependency', 'Market price fluctuation'],
  sustainabilityScore: 9,
  organicCertified: true,
  targetMarket: ['Local restaurants', 'Farmers markets'],
  pricePerKg: 4.50,
  preOrders: 500,
  images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
  videos: ['https://example.com/project-tour.mp4'],
  documents: [{
    id: 'doc1',
    name: 'Business Plan 2024.pdf',
    type: 'business_plan',
    url: '/documents/business-plan.pdf',
    uploadDate: new Date('2024-09-15'),
    verified: true
  }],
  updates: [{
    id: 'update1',
    projectId: '1',
    title: 'Excellent Growth Progress',
    description: 'Plants showing exceptional growth with 95% germination rate.',
    timestamp: new Date('2024-11-25'),
    phase: 'Growing',
    author: 'Jean Paul',
    metrics: {
      growth: 95,
      health: 92,
      weather: 'Sunny, 24°C',
      soilMoisture: 65
    },
    tags: ['growth', 'health'],
    publicVisible: true
  }],
  milestones: [{
    id: 'milestone1',
    title: 'First Harvest',
    description: 'Begin harvesting first ripe tomatoes',
    targetDate: new Date('2024-12-20'),
    status: 'pending',
    importance: 'high'
  }],
  weatherData: {
    temperature: 24,
    rainfall: 15,
    humidity: 68,
    lastUpdated: new Date('2024-12-10')
  },
  soilHealth: {
    ph: 6.5,
    nitrogen: 45,
    phosphorus: 25,
    potassium: 35,
    organicMatter: 4.2,
    lastTested: new Date('2024-11-01')
  },
  teamSize: 4,
  advisors: ['Dr. Marie Uwimana - Soil Specialist'],
  cooperativeSupport: true,
  permits: ['Agricultural Production Permit'],
  insurance: {
    provider: 'Rwanda Agricultural Insurance',
    coverage: 20000,
    premium: 800,
    expiryDate: new Date('2025-10-01')
  },
  funding: '$12,750',
  fundingGoalFormatted: '$15,000',
  roi: '28%',
  expectedHarvest: 'December 2024'
};