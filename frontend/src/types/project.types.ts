export interface Project {
    // Core fields
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
    status: string;
    contributorsCount: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    
    // Farmer info (can be object or string)
    farmer: string | {
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      [key: string]: unknown;
    };
    
    // Optional fields
    district?: string;
    priority?: string;
    department?: string;
    
    // Due diligence
    dueDiligence?: {
      status: 'pending' | 'in_progress' | 'completed';
      assignedTo?: string | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        [key: string]: unknown;
      };
      startedAt?: Date;
      completedAt?: Date;
      notes: string;
      documents: Array<{
        name: string;
        url: string;
        uploadedAt: Date;
      }>;
    };
    
    // Verification
    verification?: {
      verifiedBy?: string | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        [key: string]: unknown;
      };
      verifiedAt?: Date;
      documentHash?: string;
      rejectionReason?: string;
    };
  }