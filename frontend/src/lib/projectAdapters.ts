import { GovernmentDepartment, Project as ApiProject } from "./projectApi";
import { ApprovalStep, Project as GovProject, ProjectStatus } from "@/types/government.types";

// Convert backend API project to government dashboard project
export const adaptApiProjectToGovProject = (apiProject: ApiProject): GovProject => {
  // Map status from backend to government types
  const statusMap: Record<string, ProjectStatus> = {
    'submitted': ProjectStatus.SUBMITTED,
    'under_review': ProjectStatus.UNDER_REVIEW,
    'active': ProjectStatus.APPROVED,
    'rejected': ProjectStatus.REJECTED,
    'funded': ProjectStatus.APPROVED,
    'closed': ProjectStatus.APPROVED,
  };

  // Extract farmer info
  let farmerName = 'Unknown Farmer';
  let farmerEmail = 'Unknown';
  let farmerId = 'Unknown';
  
  if (typeof apiProject.farmer === 'object' && apiProject.farmer) {
    farmerName = `${apiProject.farmer.firstName || ''} ${apiProject.farmer.lastName || ''}`.trim() || 'Unknown Farmer';
    farmerEmail = apiProject.farmer.email || 'Unknown';
    farmerId = apiProject.farmer._id || 'Unknown';
  }

  // Determine approval step based on due diligence status
  const getApprovalStep = (): ApprovalStep => {
    if (!apiProject.dueDiligence || apiProject.dueDiligence.status === 'pending') {
      return ApprovalStep.STEP_1_INITIAL_REVIEW;
    }
    if (apiProject.dueDiligence.status === 'in_progress') {
      return ApprovalStep.STEP_2_DOCUMENTATION;
    }
    if (apiProject.dueDiligence.status === 'completed' && apiProject.status === 'active') {
      return ApprovalStep.STEP_10_APPROVED;
    }
    return ApprovalStep.STEP_1_INITIAL_REVIEW;
  };

  // Determine priority based on funding amount
  const getPriority = (): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' => {
    if (apiProject.fundingGoal >= 500000) return 'URGENT';
    if (apiProject.fundingGoal >= 100000) return 'HIGH';
    if (apiProject.fundingGoal >= 50000) return 'MEDIUM';
    return 'LOW';
  };

  // Calculate risk score based on various factors
  const calculateRiskScore = (): number => {
    let score = 50; // Base score
    
    // Adjust based on funding amount
    if (apiProject.fundingGoal > 100000) score += 20;
    if (apiProject.fundingGoal > 500000) score += 10;
    
    // Adjust based on documents
    if (!apiProject.documents || apiProject.documents.length === 0) score += 30;
    
    // Adjust based on description length
    if (!apiProject.description || apiProject.description.length < 100) score += 10;
    
    return Math.min(score, 100);
  };

  // Calculate compliance score
  const calculateComplianceScore = (): number => {
    let score = 50; // Base score
    
    // Increase score for having documents
    if (apiProject.documents && apiProject.documents.length > 0) score += 30;
    
    // Increase score for complete information
    if (apiProject.description && apiProject.description.length > 100) score += 10;
    if (apiProject.location) score += 5;
    if (apiProject.timeline) score += 5;
    
    return Math.min(score, 100);
  };

  return {
    id: apiProject._id,
    projectName: apiProject.title,
    farmerName,
    farmerEmail,
    farmerId,
    location: apiProject.location || 'Unknown',
    district: apiProject.location || 'Unknown', // Using location as district fallback
    fundingRequested: apiProject.fundingGoal || 0,
    projectType: apiProject.category || 'General',
    description: apiProject.description || 'No description provided',
    duration: 0, // Not available in API
    expectedYield: 'Not specified', // Not available in API
    expectedROI: 'Not specified', // Not available in API
    status: statusMap[apiProject.status] || ProjectStatus.SUBMITTED,
    currentApprovalStep: getApprovalStep(),
    priority: getPriority(),
    submittedAt: new Date(apiProject.createdAt),
    updatedAt: new Date(apiProject.updatedAt),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    documents: (apiProject.documents || []).map(doc => ({
      id: `${apiProject._id}-${doc.name}`, // Create unique ID
      name: doc.name,
      type: doc.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
      category: 'OTHER',
      url: doc.url,
      size: 'Unknown',
      uploadedAt: new Date(),
      verified: false,
    })),
    approvalHistory: [], // Not available in API
    dueDiligenceChecks: [], // Will be generated from due diligence data
    assignedOfficers: [], // Not available in API
    comments: [], // Not available in API
    riskScore: calculateRiskScore(),
    complianceScore: calculateComplianceScore(),
  };
};