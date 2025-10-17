import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { Model } from "mongoose";
import { Types } from "mongoose";
import { BlockchainService } from "src/blockchain/blockchain.service";
import { GovernmentDepartment } from "src/common/enums/government-department.enum";
import { UsersService } from "src/users/users.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateDueDiligenceDto } from "./dto/update-due-diligence.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Favorite, FavoriteDocument } from "./schemas/favorite.schema";
import { Project, ProjectDocument } from "./schemas/project.schema";

@Injectable()
export class ProjectsService {

  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
    private blockchainService: BlockchainService,
    private usersService: UsersService,
  ) {}

  async findAllProjects(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find()
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByFarmer(farmerId: string, status?: string): Promise<ProjectDocument[]> {
    const query: any = { 
      farmer: new Types.ObjectId(farmerId) 
    };
    
    if (status) {
      query.status = status;
    }
  
    console.log('🔍 Finding projects for farmer:', farmerId);
    console.log('   Query:', query);
  
    const projects = await this.projectModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
      
    console.log('✅ Found', projects.length, 'projects');
    
    return projects;
  }
  async findOne(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findById(id)
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .populate('dueDiligence.assignedTo', 'firstName lastName email')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(
        id,
        { $set: updateProjectDto },
        { new: true }
      )
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Project not found');
    }

    return { message: 'Project deleted successfully' };
  }

  // ==================== GOVERNMENT METHODS ====================

  async findPendingProjects(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ 
        status: { $in: ['submitted', 'under_review'] }
      })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getMyAssignedProjects(officialId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ 
        'dueDiligence.assignedTo': officialId,
        status: { $in: ['under_review', 'active'] }
      })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .sort({ 'dueDiligence.startedAt': -1 })
      .exec();
  }

  async assignDueDiligence(projectId: string, officialId: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        {
          $set: {
            status: 'under_review',
            'dueDiligence.assignedTo': officialId,
            'dueDiligence.status': 'in_progress',
            'dueDiligence.startedAt': new Date(),
          },
        },
        { new: true }
      )
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
  

  private createDocumentHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // ==================== CONTRIBUTOR METHODS ====================

  async findVerifiedProjects(category?: string, location?: string): Promise<ProjectDocument[]> {
    const query: any = {
      status: { $in: ['active', 'verified'] },
    };

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    return this.projectModel
      .find(query)
      .populate('farmer', 'firstName lastName location profileImage')
      .select('-dueDiligence -verification.documentHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async addToFavorites(userId: string, projectId: string): Promise<{ message: string }> {
    // Check if project exists
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if already favorited
    const existingFavorite = await this.favoriteModel.findOne({
      user: userId,
      project: projectId,
    });

    if (existingFavorite) {
      throw new BadRequestException('Project already in favorites');
    }

    // Add to favorites
    await this.favoriteModel.create({
      user: userId,
      project: projectId,
    });

    return { message: 'Project added to favorites' };
  }

  async removeFromFavorites(userId: string, projectId: string): Promise<{ message: string }> {
    const result = await this.favoriteModel.findOneAndDelete({
      user: userId,
      project: projectId,
    });

    if (!result) {
      throw new NotFoundException('Favorite not found');
    }

    return { message: 'Project removed from favorites' };
  }

  async getFavorites(userId: string): Promise<ProjectDocument[]> {
    const favorites = await this.favoriteModel
      .find({ user: userId })
      .populate({
        path: 'project',
        populate: {
          path: 'farmer',
          select: 'firstName lastName location profileImage',
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return favorites.map((fav: any) => fav.project).filter(Boolean);
  }

  async isFavorite(userId: string, projectId: string): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({
      user: userId,
      project: projectId,
    });
    return !!favorite;
  }

  // ==================== STATS METHODS ====================

  async getStats(): Promise<any> {
    const pipeline = [
      { $group: { 
        _id: null,
        totalProjects: { $sum: 1 },
        totalFunding: { $sum: '$fundingGoal' },
        pendingReview: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
        activeProjects: { $sum: { $cond: [{ $in: ['$status', ['active', 'under_review']] }, 1, 0] } },
        fundedProjects: { $sum: { $cond: [{ $eq: ['$status', 'funded'] }, 1, 0] } },
        rejectedProjects: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        avgProcessingDays: { 
          $avg: { 
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              (1000 * 60 * 60 * 24)
            ]
          }
        }
      } }
    ];

    const result = await this.projectModel.aggregate(pipeline).exec();
    const stats = result[0] || {};

    return {
      totalProjects: stats.totalProjects || 0,
      pendingReview: stats.pendingReview || 0,
      activeProjects: stats.activeProjects || 0,
      fundedProjects: stats.fundedProjects || 0,
      rejectedProjects: stats.rejectedProjects || 0,
      totalFunding: Math.round(stats.totalFunding || 0),
      averageProcessingTime: `${Math.round(stats.avgProcessingDays || 0)} days`,
    };
  }

  // ==================== DEPARTMENT-BASED METHODS ====================

  async updateProjectDepartment(projectId: string, department: GovernmentDepartment): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $set: { department } },
        { new: true }
      )
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .exec();
  
    if (!project) {
      throw new NotFoundException('Project not found after department update');
    }
  
    return project;
  }

  async findByDepartment(department: GovernmentDepartment): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ 
        department,
        status: { $in: ['submitted', 'under_review'] }
      })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .exec();
  }
  async create(createProjectDto: CreateProjectDto, farmerId: string): Promise<ProjectDocument> {
    console.log('=== PROJECT CREATION START ===');
    console.log('Farmer ID:', farmerId);
    
    try {
      const farmerObjectId = new Types.ObjectId(farmerId);
      
      const projectData = {
        ...createProjectDto,
        projectId: randomUUID(),
        farmer: farmerObjectId,
        status: 'submitted',
        currentFunding: 0,
        contributorsCount: 0,
        department: GovernmentDepartment.GENERAL,
        submittedAt: new Date(),
        dueDiligence: {
          status: 'pending' as const,
          notes: '',
          documents: [],
        },
        verification: {},
        blockchainStatus: 'not_created', // Add blockchain status
      };
  
      console.log('Project data to save:', projectData);
  
      const project = new this.projectModel(projectData);
      const savedProject = await project.save();
      
      console.log('=== PROJECT CREATION SUCCESS ===');
      console.log('Saved project ID:', savedProject._id);
      
      // Auto-create on blockchain after saving (non-blocking)
      this.createBlockchainProject(savedProject).catch(error => {
        this.logger.error('Background blockchain creation failed:', error);
      });
      
      return savedProject;
    } catch (error) {
      console.log('=== PROJECT CREATION ERROR ===');
      console.error('Error details:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }


  // Get all projects for government dashboard with department info
  async getAllProjectsForGovernment(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({})
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get projects by status and department
  async findProjectsByStatusAndDepartment(
    status: string[], 
    department?: GovernmentDepartment
  ): Promise<ProjectDocument[]> {
    const query: any = { status: { $in: status } };
    
    if (department) {
      query.department = department;
    }

    return this.projectModel
      .find(query)
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get department statistics
  async getDepartmentStats(): Promise<any> {
    const pipeline = [
      {
        $group: {
          _id: '$department',
          totalProjects: { $sum: 1 },
          pendingReview: { 
            $sum: { 
              $cond: [{ $in: ['$status', ['submitted', 'under_review']] }, 1, 0] 
            } 
          },
          approved: { 
            $sum: { 
              $cond: [{ $in: ['$status', ['active', 'verified', 'funded']] }, 1, 0] 
            } 
          },
          rejected: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] 
            } 
          },
          totalFunding: { $sum: '$fundingGoal' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalProjects: 1,
          pendingReview: 1,
          approved: 1,
          rejected: 1,
          totalFunding: 1,
          _id: 0
        }
      }
    ];

    const result = await this.projectModel.aggregate(pipeline).exec();
    return result || [];
  }


  private calculateMilestones(timeline: string): number {
    // Convert timeline like "10 Months" to milestone count
    const match = timeline.match(/(\d+)\s*(month|week|day)s?/i);
    if (!match) return 3; // default
    
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'month': return Math.min(amount, 6); // max 6 milestones
      case 'week': return Math.min(Math.ceil(amount / 4), 6);
      default: return 3;
    }
  }

  private async createBlockchainProject(project: ProjectDocument): Promise<void> {
    try {
      const farmer = await this.usersService.findById(project.farmer.toString());
      
      if (!farmer?.walletAddress) {
        this.logger.warn(`Farmer ${project.farmer} has no wallet address - skipping blockchain creation`);
        return;
      }
  
      // Convert timeline to days
      const timelineDays = this.convertTimelineToDays(project.timeline);
  
      const blockchainData = {
        title: project.title,
        description: project.description.substring(0, 500), // Limit description
        fundingGoal: project.fundingGoal,
        category: project.category,
        location: project.location,
        timeline: timelineDays,
        farmerWallet: farmer.walletAddress,
      };
  
      const result = await this.blockchainService.createProjectOnChain(blockchainData);
  
      // Update project with blockchain info
      await this.projectModel.findByIdAndUpdate(project._id, {
        blockchainProjectId: result.projectId,
        blockchainStatus: 'created',
        blockchainTxHash: result.txHash,
        blockchainCreatedAt: new Date(),
      });
  
      this.logger.log(`Project ${project._id} created on blockchain with ID: ${result.projectId}`);
    } catch (error) {
      // Mark as failed but don't block the project creation
      await this.projectModel.findByIdAndUpdate(project._id, {
        blockchainStatus: 'failed',
      });
      
      this.logger.error(`Failed to create blockchain entry for project ${project._id}:`, error);
      // Don't throw error - project can exist without blockchain initially
    }
  }
  
  
  private convertTimelineToDays(timeline: string): number {
    const match = timeline.match(/(\d+)\s*(month|week|day)s?/i);
    if (!match) return 90; // default 90 days
    
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'month': return amount * 30;
      case 'week': return amount * 7;
      case 'day': return amount;
      default: return 90;
    }
  }  

 // Check and update project completion status
async checkAndUpdateProjectCompletion(projectId: string): Promise<ProjectDocument> {
  const project = await this.findOne(projectId);
  
  if (!project.blockchainProjectId || project.blockchainStatus !== 'created') {
    throw new BadRequestException('Project not on blockchain or blockchain creation failed');
  }

  if (project.status === 'funded') {
    return project; // Already funded
  }

  // Check blockchain for funding status
  const blockchainStatus = await this.blockchainService.checkProjectCompletion(
    project.blockchainProjectId
  );

  // Update local database if funded on blockchain
  if (blockchainStatus.isFunded && !project.isBlockchainFunded) {
    const updatedProject = await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        status: 'funded',
        isBlockchainFunded: true,
        blockchainFundedAt: new Date(),
        currentFunding: parseFloat(blockchainStatus.totalFunding),
      },
      { new: true }
    );

    if (!updatedProject) {
      throw new NotFoundException('Project not found after funding update');
    }

    this.logger.log(`Project ${projectId} marked as funded from blockchain`);
    return updatedProject;
  }

  return project;
}

async verifyProject(projectId: string, officialId: string, notes?: string): Promise<ProjectDocument> {
  this.logger.log(`🔍 Starting verification for project ${projectId}`);
  
  const project = await this.findOne(projectId);
  
  this.logger.log(`📋 Project current status: ${project.status}`);

  // FIX: Allow verification from BOTH 'submitted' AND 'under_review'
  if (!['submitted', 'under_review'].includes(project.status)) {
    this.logger.error(`❌ Cannot verify project with status: ${project.status}`);
    throw new BadRequestException(
      `Cannot verify project with status '${project.status}'. Project must be 'submitted' or 'under_review'.`
    );
  }

  this.logger.log(`✅ Status check passed. Proceeding with verification...`);

  // Create document hash
  const documentHash = this.createDocumentHash({
    projectId: project.projectId,
    documents: project.documents,
    dueDiligenceNotes: project.dueDiligence?.notes || '',
    verifiedAt: new Date(),
  });

  this.logger.log(`📝 Document hash created: ${documentHash.substring(0, 16)}...`);
  this.logger.log(`✅ Updating project to 'active' status...`);

  const updatedProject = await this.projectModel
    .findByIdAndUpdate(
      projectId,
      {
        $set: {
          status: 'active', // This makes it show in farmer dashboard!
          'verification.verifiedBy': officialId,
          'verification.verifiedAt': new Date(),
          'verification.documentHash': documentHash,
          'dueDiligence.status': 'completed', // Mark due diligence as done
          'dueDiligence.completedAt': new Date(),
        },
      },
      { new: true }
    )
    .populate('farmer', 'firstName lastName email phoneNumber location')
    .populate('verification.verifiedBy', 'firstName lastName email')
    .exec();

  if (!updatedProject) {
    this.logger.error(`❌ Project not found after update: ${projectId}`);
    throw new NotFoundException('Project not found after update');
  }

  this.logger.log(`✅ PROJECT VERIFIED SUCCESSFULLY!`);
  this.logger.log(`   - Project ID: ${projectId}`);
  this.logger.log(`   - Title: ${updatedProject.title}`);
  this.logger.log(`   - New Status: ${updatedProject.status}`);
  this.logger.log(`   - Verified By: ${officialId}`);
  this.logger.log(`   - Verified At: ${updatedProject.verification.verifiedAt}`);

  return updatedProject;
}
  
  async rejectProject(projectId: string, officialId: string, reason: string): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
  
    if (!['submitted', 'under_review'].includes(project.status)) {
      throw new BadRequestException('Can only reject submitted or under review projects');
    }
  
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        {
          $set: {
            status: 'rejected',
            'verification.verifiedBy': officialId,
            'verification.verifiedAt': new Date(),
            'verification.rejectionReason': reason,
          },
        },
        { new: true }
      )
      .exec();
  
    if (!updatedProject) {
      throw new NotFoundException('Project not found after update');
    }
  
    return updatedProject;
  }
  
  async updateDueDiligence(
    projectId: string,
    officialId: string,
    updateDto: UpdateDueDiligenceDto,
  ): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
  
    const updateData: any = {};
    
    if (updateDto.notes) {
      updateData['dueDiligence.notes'] = updateDto.notes;
    }
    
    if (updateDto.status) {
      updateData['dueDiligence.status'] = updateDto.status;
      if (updateDto.status === 'completed') {
        updateData['dueDiligence.completedAt'] = new Date();
      }
    }
    
    if (updateDto.documents) {
      updateData['dueDiligence.documents'] = [
        ...(project.dueDiligence.documents || []),
        ...updateDto.documents.map(doc => ({
          ...doc,
          uploadedAt: new Date(),
        })),
      ];
    }
  
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(projectId, { $set: updateData }, { new: true })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email')
      .exec();
  
    if (!updatedProject) {
      throw new NotFoundException('Project not found after update');
    }
  
    return updatedProject;
  }
  
  // Complete project on blockchain when goals are met
  async completeProject(projectId: string, officialId: string): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
  
    if (project.status !== 'funded') {
      throw new BadRequestException('Only funded projects can be completed');
    }
  
    if (!project.blockchainProjectId) {
      throw new BadRequestException('Project not on blockchain');
    }
  
    // Mark as completed on blockchain
    const result = await this.blockchainService.completeProjectOnChain(project.blockchainProjectId);
  
    // Update local project status
    const updatedProject = await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        status: 'closed',
        'verification.verifiedBy': officialId,
        'verification.verifiedAt': new Date(),
        'verification.blockchainTxHash': result.txHash,
      },
      { new: true }
    );
  
    if (!updatedProject) {
      throw new NotFoundException('Project not found after completion');
    }
  
    return updatedProject;
  }
  
  /**
   * Complete project on blockchain
   */
  async completeProjectOnBlockchain(projectId: string, officialId: string): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
  
    if (!project.blockchainProjectId) {
      throw new BadRequestException('Project not on blockchain');
    }
  
    if (project.status !== 'active') {
      throw new BadRequestException('Only active projects can be completed');
    }
  
    // Complete on blockchain
    const result = await this.blockchainService.completeProjectOnChain(project.blockchainProjectId);
  
    // Update local project
    const updatedProject = await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        status: 'closed',
        'verification.verifiedBy': officialId,
        'verification.verifiedAt': new Date(),
        'verification.blockchainTxHash': result.txHash,
      },
      { new: true }
    );
  
    if (!updatedProject) {
      throw new NotFoundException('Project not found after blockchain completion');
    }
  
    return updatedProject;
  }

  // Background job to sync blockchain status
  async syncBlockchainStatus(projectId: string): Promise<void> {
    const project = await this.findOne(projectId);
    
    if (!project.blockchainProjectId || project.blockchainStatus !== 'created') {
      return;
    }

    try {
      const blockchainStatus = await this.blockchainService.checkProjectCompletion(
        project.blockchainProjectId
      );

      const updates: any = {};

      // Update funding if changed
      if (parseFloat(blockchainStatus.totalFunding) !== project.currentFunding) {
        updates.currentFunding = parseFloat(blockchainStatus.totalFunding);
      }

      // Update completion status
      if (blockchainStatus.isCompleted && project.status !== 'closed') {
        updates.status = 'closed';
      }

      if (Object.keys(updates).length > 0) {
        await this.projectModel.findByIdAndUpdate(projectId, updates);
        this.logger.log(`Synced blockchain status for project ${projectId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync blockchain status for project ${projectId}:`, error);
    }
  }

  /**
 * Check blockchain status for a project
 */
async getBlockchainStatus(projectId: string): Promise<any> {
  const project = await this.findOne(projectId);
  
  if (!project.blockchainProjectId) {
    return {
      blockchainEnabled: false,
      message: 'Project not on blockchain'
    };
  }

  try {
    const blockchainStatus = await this.blockchainService.checkProjectCompletion(project.blockchainProjectId);
    
    return {
      blockchainEnabled: true,
      projectId: project.blockchainProjectId,
      ...blockchainStatus,
      localFunding: project.currentFunding,
      localStatus: project.status
    };
  } catch (error) {
    return {
      blockchainEnabled: true,
      projectId: project.blockchainProjectId,
      error: 'Failed to fetch blockchain status',
      localFunding: project.currentFunding,
      localStatus: project.status
    };
  }
}

}