// ============================================
// FILE: types/government.types.ts
// ============================================
export enum ProjectStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_REVISION = 'REQUIRES_REVISION',
  ON_HOLD = 'ON_HOLD'
}


export enum ApprovalStep {
    STEP_1_INITIAL_REVIEW = 'STEP_1_INITIAL_REVIEW',
    STEP_2_DOCUMENTATION = 'STEP_2_DOCUMENTATION',
    STEP_3_LAND_VERIFICATION = 'STEP_3_LAND_VERIFICATION',
    STEP_4_FINANCIAL_REVIEW = 'STEP_4_FINANCIAL_REVIEW',
    STEP_5_TECHNICAL_EVAL = 'STEP_5_TECHNICAL_EVAL',
    STEP_6_COMPLIANCE = 'STEP_6_COMPLIANCE',
    STEP_7_SITE_INSPECTION = 'STEP_7_SITE_INSPECTION',
    STEP_8_RISK_ASSESSMENT = 'STEP_8_RISK_ASSESSMENT',
    STEP_9_FINAL_REVIEW = 'STEP_9_FINAL_REVIEW',
    STEP_10_APPROVED = 'STEP_10_APPROVED',
    INITIAL_REVIEW = "INITIAL_REVIEW"
}

export interface Project {
  id: string;
  projectName: string;
  farmerName: string;
  farmerEmail: string;
  farmerId: string;
  location: string;
  district: string;
  fundingRequested: number;
  projectType: string;
  description: string;
  duration: number;
  expectedYield: string;
  expectedROI: string;
  status: ProjectStatus;
  currentApprovalStep: ApprovalStep;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  submittedAt: Date;
  updatedAt: Date;
  dueDate: Date;
  documents: ProjectDocument[];
  approvalHistory: ApprovalHistory[];
  dueDiligenceChecks: DueDiligenceCheck[];
  assignedOfficers: AssignedOfficer[];
  comments: ProjectComment[];
  riskScore: number;
  complianceScore: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  category: 'LAND_DOCUMENTS' | 'BUSINESS_PLAN' | 'FINANCIAL' | 'TECHNICAL' | 'IDENTITY' | 'OTHER';
  url: string;
  size: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  remarks?: string;
}

export interface ApprovalHistory {
  id: string;
  step: ApprovalStep;
  action: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'ON_HOLD' | 'MOVED_TO_NEXT_STEP';
  comment: string;
  officerId: string;
  officerName: string;
  officerRole: string;
  timestamp: Date;
}

export interface DueDiligenceCheck {
  id: string;
  category: 'DOCUMENTATION' | 'LEGAL' | 'FINANCIAL' | 'TECHNICAL' | 'ENVIRONMENTAL' | 'SOCIAL';
  checkName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  assignedTo: string;
  findings: string;
  recommendation: 'APPROVE' | 'REJECT' | 'NEEDS_MORE_INFO';
  completedAt?: Date;
  score: number;
}

export interface AssignedOfficer {
  id: string;
  officerId: string;
  officerName: string;
  role: 'REVIEWER' | 'INSPECTOR' | 'ANALYST' | 'APPROVER';
  department: string;
  assignedAt: Date;
  taskStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ProjectComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  timestamp: Date;
  isInternal: boolean;
}
