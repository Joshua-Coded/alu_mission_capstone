import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GovernmentDepartment, ProjectCategory, User, UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { ProjectsService } from "./projects.service";

@Injectable()
export class ProjectAssignmentService {
  private readonly logger = new Logger(ProjectAssignmentService.name);

  constructor(
    private usersService: UsersService,
    private projectsService: ProjectsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Map project categories to departments (NO ASSIGNMENT - just categorization)
  async categorizeProjectByDepartment(projectCategory: ProjectCategory): Promise<GovernmentDepartment> {
    this.logger.log(`🏷️ Categorizing ${projectCategory} project by department`);

    const categoryToDepartmentMap: Record<ProjectCategory, GovernmentDepartment> = {
      [ProjectCategory.POULTRY_FARMING]: GovernmentDepartment.POULTRY,
      [ProjectCategory.CROP_PRODUCTION]: GovernmentDepartment.CROPS,
      [ProjectCategory.LIVESTOCK_FARMING]: GovernmentDepartment.LIVESTOCK,
      [ProjectCategory.FISH_FARMING]: GovernmentDepartment.FISHERIES,
      [ProjectCategory.VEGETABLE_FARMING]: GovernmentDepartment.HORTICULTURE,
      [ProjectCategory.FRUIT_FARMING]: GovernmentDepartment.HORTICULTURE,
      [ProjectCategory.AGRO_PROCESSING]: GovernmentDepartment.AGRIBUSINESS,
      [ProjectCategory.SUSTAINABLE_AGRICULTURE]: GovernmentDepartment.SUSTAINABILITY,
      [ProjectCategory.ORGANIC_FARMING]: GovernmentDepartment.SUSTAINABILITY,
      [ProjectCategory.GENERAL_AGRICULTURE]: GovernmentDepartment.GENERAL,
    };

    const targetDepartment = categoryToDepartmentMap[projectCategory] || GovernmentDepartment.GENERAL;
    
    this.logger.log(`✅ Project categorized to: ${targetDepartment}`);
    return targetDepartment;
  }

  // Auto-categorize when project is submitted (NO ASSIGNMENT)
  async autoCategorizeSubmittedProject(projectId: string, projectCategory: ProjectCategory) {
    try {
      this.logger.log(`🤖 Auto-categorizing submitted project: ${projectId}`);
      
      const department = await this.categorizeProjectByDepartment(projectCategory);
      
      // Update project with department (NO assignment to specific official)
      const updatedProject = await this.projectsService.updateProjectDepartment(projectId, department);
      
      this.logger.log(`✅ Auto-categorization successful for ${projectId} -> ${department}`);
      
      return {
        success: true,
        department,
        project: updatedProject,
        message: 'Project categorized by department successfully'
      };
      
    } catch (error: any) {
      this.logger.error(`❌ Auto-categorization failed: ${error.message}`);
      
      return {
        success: false,
        department: GovernmentDepartment.GENERAL,
        error: error.message,
        message: 'Auto-categorization failed - using GENERAL department'
      };
    }
  }

  // Get projects by department (for government officials)
  async getProjectsByDepartment(department: GovernmentDepartment, officialId?: string) {
    this.logger.log(`📋 Getting projects for department: ${department}`);
    
    // Any official in this department can see ALL projects in their department
    const projects = await this.projectsService.findByDepartment(department);
    
    return {
      department,
      totalProjects: projects.length,
      projects,
      message: `Found ${projects.length} projects in ${department} department`
    };
  }

  // Get department recommendations (for UI display)
  async getDepartmentRecommendations(projectCategory: ProjectCategory) {
    const targetDepartment = await this.categorizeProjectByDepartment(projectCategory);

    // Get officials from the target department
    const departmentOfficials = await this.findByDepartment(targetDepartment);

    return {
      recommendedDepartment: targetDepartment,
      projectCategory,
      message: `This project belongs to ${targetDepartment} department`,
      // Include available officials for information (not for assignment)
      departmentOfficials
    };
  }

  // Find users by department
  async findByDepartment(department: GovernmentDepartment): Promise<UserDocument[]> {
    return this.userModel
      .find({ 
        department,
        role: 'GOVERNMENT_OFFICIAL',
        isActive: true 
      })
      .select('firstName lastName email department specializations currentWorkload maxWorkload')
      .exec();
  }

  // Find user by ID (for department checks)
  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Get workload statistics (optional - for dashboard)
  async getWorkloadStats(): Promise<any> {
    try {
      const stats = await this.userModel.aggregate([
        {
          $match: { 
            role: 'GOVERNMENT_OFFICIAL', 
            isActive: true 
          }
        },
        {
          $group: {
            _id: '$department',
            totalOfficials: { $sum: 1 },
            totalCapacity: { $sum: '$maxWorkload' },
            currentWorkload: { $sum: '$currentWorkload' },
            avgWorkload: { $avg: '$currentWorkload' },
          }
        },
        {
          $project: {
            department: '$_id',
            totalOfficials: 1,
            totalCapacity: 1,
            currentWorkload: 1,
            utilizationRate: {
              $round: [
                { $multiply: [
                  { $divide: ['$currentWorkload', { $max: ['$totalCapacity', 1] }] },
                  100
                ] },
                1
              ]
            },
            avgWorkload: { $round: ['$avgWorkload', 1] },
            _id: 0
          }
        }
      ]).exec();

      return {
        departments: stats,
        overallUtilization: stats.length > 0 
          ? Math.round(stats.reduce((sum: number, dept: any) => sum + dept.utilizationRate, 0) / stats.length)
          : 0
      };
    } catch (error: any) {
      this.logger.error(`Workload stats error: ${error.message}`);
      throw new Error('Failed to get workload statistics');
    }
  }

  // Get available government officials by department (for information only)
  async findAvailableGovernmentOfficials(department: GovernmentDepartment, projectCategory?: ProjectCategory) {
    return this.userModel
      .find({
        department,
        role: 'GOVERNMENT_OFFICIAL',
        isActive: true,
        $expr: { $lt: ['$currentWorkload', '$maxWorkload'] } // Only those with capacity
      })
      .select('firstName lastName email department specializations currentWorkload maxWorkload projectsReviewed')
      .sort({ currentWorkload: 1 }) // Least busy first
      .exec();
  }

  // Increment workload (optional - if you want to track activity)
  async incrementWorkload(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { currentWorkload: 1 } }
    ).exec();
  }

  // Decrement workload (optional - if projects get completed/rejected)
  async decrementWorkload(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { currentWorkload: -1 } }
    ).exec();
  }
}