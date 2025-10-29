import { Injectable } from "@nestjs/common";
import { ProjectDocument } from "./schemas/project.schema";

/**
 * Service to transform project responses to ensure MATIC currency is always displayed
 * and USD is never shown
 */
@Injectable()
export class ProjectResponseTransformer {
  /**
   * Transform a single project to ensure MATIC-only response
   */
  transformProject(project: ProjectDocument): any {
    const projectObj = project.toObject ? project.toObject() : project;
    
    return {
      ...projectObj,
      // ✅ Ensure currency is ALWAYS MATIC
      currency: 'MATIC',
      
      // ✅ Add explicit MATIC fields
      fundingGoalMatic: projectObj.fundingGoal,
      currentFundingMatic: projectObj.currentFunding,
      
      // ✅ Add formatted display strings
      fundingGoalFormatted: `${projectObj.fundingGoal} MATIC`,
      currentFundingFormatted: `${projectObj.currentFunding} MATIC`,
      
      // ✅ Calculate progress percentage
      fundingProgress: projectObj.fundingGoal > 0 
        ? ((projectObj.currentFunding / projectObj.fundingGoal) * 100).toFixed(2)
        : '0.00',
      
      // ✅ Add remaining amount needed
      remainingFunding: Math.max(0, projectObj.fundingGoal - projectObj.currentFunding),
      remainingFundingFormatted: `${Math.max(0, projectObj.fundingGoal - projectObj.currentFunding)} MATIC`,
      
      // ✅ Add blockchain funding info
      blockchainInfo: {
        projectId: projectObj.blockchainProjectId,
        status: projectObj.blockchainStatus,
        txHash: projectObj.blockchainTxHash,
        contractCurrency: 'MATIC',
        network: 'Polygon Mainnet',
        chainId: 137,
      },
      
      // ✅ Remove any USD references (just in case)
      fundingGoalUSD: undefined,
      currentFundingUSD: undefined,
    };
  }

  /**
   * Transform multiple projects
   */
  transformProjects(projects: ProjectDocument[]): any[] {
    return projects.map(project => this.transformProject(project));
  }

  /**
   * Transform project stats to show MATIC
   */
  transformStats(stats: any): any {
    return {
      ...stats,
      currency: 'MATIC',
      totalFundingMatic: stats.totalFunding,
      totalFundingFormatted: `${stats.totalFunding || 0} MATIC`,
      // Remove USD references
      totalFundingUSD: undefined,
    };
  }

  /**
   * Transform department stats
   */
  transformDepartmentStats(stats: any[]): any[] {
    return stats.map(stat => ({
      ...stat,
      currency: 'MATIC',
      totalFundingMatic: stat.totalFunding,
      totalFundingFormatted: `${stat.totalFunding || 0} MATIC`,
      totalFundingUSD: undefined,
    }));
  }
}