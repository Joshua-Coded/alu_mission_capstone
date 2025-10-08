// ============================================
// FILE: types/contributor.types.ts
// Contributor = Investor who funds approved projects
// ============================================

export enum ProjectStatus {
    APPROVED_FOR_FUNDING = 'APPROVED_FOR_FUNDING',
    FUNDING_IN_PROGRESS = 'FUNDING_IN_PROGRESS',
    FULLY_FUNDED = 'FULLY_FUNDED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
  }
  
  export interface ApprovedProject {
    id: string;
    projectName: string;
    farmerName: string;
    farmerEmail: string;
    farmerId: string;
    location: string;
    district: string;
    description: string;
    projectType: string;
    
    // Funding details
    fundingGoal: number;
    currentFunding: number;
    fundingProgress: number; // percentage
    minimumContribution: number;
    
    // Impact metrics (not ROI-focused)
    expectedImpact: string;
    beneficiaries: number;
    jobsCreated: number;
    sustainabilityScore: number;
    
    // Project details
    duration: number; // months
    expectedYield: string;
    status: ProjectStatus;
    
    // Media and documents
    images: string[];
    videos: string[];
    documents: ProjectDocument[];
    
    // Government verification
    approvedBy: string;
    approvedAt: Date;
    verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION';
    governmentComments: string;
    
    // Contributor tracking
    totalContributors: number;
    contributors: Contributor[];
    
    createdAt: Date;
    fundingDeadline: Date;
  }
  
  export interface ProjectDocument {
    id: string;
    name: string;
    type: 'BUSINESS_PLAN' | 'LAND_CERTIFICATE' | 'FINANCIAL' | 'TECHNICAL' | 'OTHER';
    url: string;
    size: string;
    verified: boolean;
    verifiedBy?: string;
  }
  
  export interface Contributor {
    id: string;
    name: string;
    walletAddress: string;
    amount: number;
    contributedAt: Date;
    transactionHash: string;
  }
  
  export interface MyContribution {
    id: string;
    projectId: string;
    projectName: string;
    farmerName: string;
    amount: number;
    contributedAt: Date;
    transactionHash: string;
    projectStatus: ProjectStatus;
    impactSoFar: string;
  }
  
  export interface ContributorStats {
    totalContributed: number;
    activeProjects: number;
    completedProjects: number;
    totalImpact: string;
    livesImpacted: number;
  }