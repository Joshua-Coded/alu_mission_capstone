export interface ValidationResult {
    isValid: boolean;
    errors: string[];
  }

  interface ProjectFormData {
    projectName: string;
    description: string;
    category: string;
    location: string;
    fundingGoal: number | string;
    timeline: string;
    [key: string]: unknown; // Allow other properties
  }
  
  
  export const validateProjectForm = (data: ProjectFormData): string[] => {
    const errors: string[] = [];
  
    if (!data.projectName || data.projectName.trim().length < 3) {
      errors.push('Project name must be at least 3 characters long');
    }
  
    if (!data.description || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }
  
    if (!data.category) {
      errors.push('Please select a category');
    }
  
    if (!data.location || data.location.trim().length < 2) {
      errors.push('Please provide a valid location');
    }
  
    const fundingGoal = typeof data.fundingGoal === 'string' 
      ? parseFloat(data.fundingGoal) 
      : data.fundingGoal;
      
    if (!fundingGoal || fundingGoal <= 0) {
      errors.push('Funding goal must be greater than 0');
    }
  
    if (!data.timeline || data.timeline.trim().length < 2) {
      errors.push('Please provide a timeline');
    }
  
    return errors;
  };
  
  export const validateWalletAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  