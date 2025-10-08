export interface ValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  export const validateProjectForm = (data: any): ValidationResult => {
    const errors: string[] = [];
  
    if (!data.projectName || data.projectName.trim().length < 3) {
      errors.push('Project name must be at least 3 characters long');
    }
  
    if (!data.description || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }
  
    if (!data.cropType) {
      errors.push('Please select a crop type');
    }
  
    if (!data.fundingGoal || data.fundingGoal < 100) {
      errors.push('Funding goal must be at least $100');
    }
  
    if (data.expectedROI && (data.expectedROI < 0 || data.expectedROI > 100)) {
      errors.push('Expected ROI must be between 0% and 100%');
    }
  
    if (data.farmSize && data.farmSize <= 0) {
      errors.push('Farm size must be greater than 0');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const validateWalletAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  