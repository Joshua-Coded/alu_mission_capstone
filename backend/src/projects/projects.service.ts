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

  // ✅ FIXED

async findByFarmer(farmerId: string, status?: string): Promise<ProjectDocument[]> {
  this.logger.log('=== FIND BY FARMER ===');
  this.logger.log(`Farmer ID: ${farmerId}`);
  
  if (!farmerId || farmerId === 'undefined' || farmerId === 'null') {
    this.logger.error('Invalid farmer ID');
    return [];
  }
  
  // Build query that works for BOTH string and ObjectId
  const query: any = {
    $or: [
      { farmer: farmerId }, // If stored as string
      { farmer: Types.ObjectId.isValid(farmerId) ? new Types.ObjectId(farmerId) : null }, // If stored as ObjectId
    ]
  };
  
  if (status) {
    query.status = status;
  }

  const projects = await this.projectModel
    .find(query)
    .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
    .populate('dueDiligence.assignedTo', 'firstName lastName email')
    .populate('verification.verifiedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .exec();
  
  this.logger.log(`✅ Found ${projects.length} projects`);
  
  // DEBUG: If no projects found, check what's in DB
  if (projects.length === 0) {
    this.logger.warn('No projects found. Checking database...');
    const sample = await this.projectModel.findOne({}).select('farmer').lean().exec();
    if (sample) {
      this.logger.warn(`Sample farmer field type: ${typeof sample.farmer}`);
      this.logger.warn(`Sample farmer value: ${sample.farmer}`);
    }
  }
  
  return projects;
}

  async findOne(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findById(id)
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .populate('dueDiligence.assignedTo', 'firstName lastName email')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .exec();

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, { $set: updateProjectDto }, { new: true, runValidators: true })
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .exec();

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Project not found');
    await this.favoriteModel.deleteMany({ project: id }).exec();
    return { message: 'Project deleted successfully' };
  }

  async findPendingProjects(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ status: { $in: ['submitted', 'under_review'] } })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getMyAssignedProjects(officialId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ 'dueDiligence.assignedTo': new Types.ObjectId(officialId), status: { $in: ['under_review', 'active'] } })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
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
            'dueDiligence.assignedTo': new Types.ObjectId(officialId),
            'dueDiligence.status': 'in_progress',
            'dueDiligence.startedAt': new Date(),
          },
        },
        { new: true, runValidators: true }
      )
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .exec();

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
  
  async create(createProjectDto: CreateProjectDto, farmerId: string): Promise<ProjectDocument> {
    const projectId = randomUUID();
    
    // Get farmer's wallet address
    const farmer = await this.usersService.findById(farmerId);
    
    if (!farmer.walletAddress) {
      throw new BadRequestException(
        'You must connect your wallet before creating a project. Please connect your MetaMask wallet in your profile settings.'
      );
    }
  
    // Validate minimum funding goal (5 MATIC)
    if (createProjectDto.fundingGoal < 5) {
      throw new BadRequestException('Minimum funding goal is 5 MATIC');
    }
  
    this.logger.log('=== CREATE PROJECT ===');
    this.logger.log(`Title: ${createProjectDto.title}`);
    this.logger.log(`Funding Goal: ${createProjectDto.fundingGoal} MATIC`);
    this.logger.log(`Farmer ID: ${farmerId}`);
    this.logger.log(`Farmer Wallet: ${farmer.walletAddress}`);
  
    // Create project in database first
    const newProject = new this.projectModel({
      ...createProjectDto,
      projectId,
      farmer: farmerId,
      farmerWalletAddress: farmer.walletAddress, // ✅ This is critical!
      status: 'submitted',
      submittedAt: new Date(),
      currentFunding: 0,
      contributorsCount: 0,
      milestonesCompleted: 0,
      totalMilestones: 0,
      isBlockchainFunded: false,
      blockchainProjectId: null,
      blockchainStatus: 'pending',
      blockchainTxHash: '',
    });
  
    const savedProject = await newProject.save();
  
    this.logger.log(`✅ Project saved to database with ID: ${savedProject._id}`);
  
    // ✅ AUTO-DEPLOY TO BLOCKCHAIN (only after verification)
    // Note: Deployment happens in verifyProject method, not here
    
    return savedProject;
  }
  // Helper method to parse timeline string to days
  private parseTimelineToDays(timeline: string | number): number {
    if (typeof timeline === 'number') {
      return timeline;
    }
  
    // Parse strings like "5 months", "18 Months", "30 days", etc.
    const match = timeline.match(/(\d+)\s*(day|days|month|months|week|weeks|year|years)/i);
    
    if (!match) {
      // Default to 30 days if can't parse
      return 30;
    }
  
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
  
    switch (unit) {
      case 'day':
      case 'days':
        return value;
      case 'week':
      case 'weeks':
        return value * 7;
      case 'month':
      case 'months':
        return value * 30;
      case 'year':
      case 'years':
        return value * 365;
      default:
        return 30;
    }
  }

  async verifyProject(projectId: string, officialId: string, notes?: string): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
    
    if (!['submitted', 'under_review'].includes(project.status)) {
      throw new BadRequestException(`Cannot verify project with status: ${project.status}`);
    }
  
    if (!project.farmerWalletAddress) {
      throw new BadRequestException('Farmer must have a wallet address connected');
    }
  
    const documentHash = this.createDocumentHash({
      projectId: project.projectId,
      documents: project.documents,
      verifiedAt: new Date(),
    });
  
    // ✅ DEPLOY TO BLOCKCHAIN WHEN VERIFIED
    let blockchainProjectId: number | null = null;
    let blockchainTxHash = '';
    let blockchainStatus = 'pending';
  
    try {
      this.logger.log('🚀 Deploying verified project to blockchain...');
      
      const timelineInDays = this.parseTimelineToDays(project.timeline);
      
      const result = await this.blockchainService.createProjectOnChain({
        title: project.title,
        description: project.description,
        fundingGoal: project.fundingGoal,
        category: project.category,
        location: project.location,
        timeline: timelineInDays,
        farmerWallet: project.farmerWalletAddress,
      });
  
      blockchainProjectId = result.projectId;
      blockchainTxHash = result.txHash;
      blockchainStatus = 'created';
  
      this.logger.log(`✅ Blockchain deployment successful!`);
      this.logger.log(`   - Blockchain Project ID: ${blockchainProjectId}`);
      this.logger.log(`   - Transaction Hash: ${blockchainTxHash}`);
      this.logger.log(`   - Farmer Wallet: ${project.farmerWalletAddress}`);
    } catch (error: any) {
      this.logger.error(`❌ Blockchain deployment failed: ${error.message}`);
      blockchainStatus = 'failed';
    }
  
    // Update project with verification AND blockchain info
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        {
          $set: {
            status: 'active',
            'verification.verifiedBy': new Types.ObjectId(officialId),
            'verification.verifiedAt': new Date(),
            'verification.documentHash': documentHash,
            'verification.notes': notes || '',
            'dueDiligence.status': 'completed',
            'dueDiligence.completedAt': new Date(),
            blockchainProjectId: blockchainProjectId,
            blockchainStatus: blockchainStatus,
            blockchainTxHash: blockchainTxHash,
          },
        },
        { new: true, runValidators: true }
      )
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .exec();
  
    if (!updatedProject) {
      throw new NotFoundException('Project not found after update');
    }
  
    this.logger.log(`✅ PROJECT VERIFIED AND DEPLOYED: ${updatedProject.title}`);
    
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
            'verification.verifiedBy': new Types.ObjectId(officialId),
            'verification.verifiedAt': new Date(),
            'verification.rejectionReason': reason,
          },
        },
        { new: true, runValidators: true }
      )
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .exec();
  
    if (!updatedProject) throw new NotFoundException('Project not found after update');
    return updatedProject;
  }
  
  async updateDueDiligence(projectId: string, officialId: string, updateDto: UpdateDueDiligenceDto): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
    const updateData: any = {};
    
    if (updateDto.notes !== undefined) updateData['dueDiligence.notes'] = updateDto.notes;
    if (updateDto.status) {
      updateData['dueDiligence.status'] = updateDto.status;
      if (updateDto.status === 'completed') updateData['dueDiligence.completedAt'] = new Date();
    }
    if (updateDto.documents && updateDto.documents.length > 0) {
      updateData['dueDiligence.documents'] = [
        ...(project.dueDiligence?.documents || []),
        ...updateDto.documents.map(doc => ({ ...doc, uploadedAt: new Date() })),
      ];
    }
  
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(projectId, { $set: updateData }, { new: true, runValidators: true })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('dueDiligence.assignedTo', 'firstName lastName email')
      .exec();
  
    if (!updatedProject) throw new NotFoundException('Project not found after update');
    return updatedProject;
  }


async recordContribution(projectId: string, contributorId: string, amount: number, walletAddress: string, txHash: string): Promise<ProjectDocument> {
  this.logger.log(`💰 RECORD CONTRIBUTION: ${amount} MATIC to ${projectId} from ${contributorId}`);
  
  const project = await this.findOne(projectId);
  
  if (project.status !== 'active') {
    throw new BadRequestException('Can only contribute to active projects');
  }
  
  if (amount <= 0) {
    throw new BadRequestException('Amount must be greater than 0');
  }

  // ✅ FIXED: Use the correct schema fields
  const updatedProject = await this.projectModel
    .findByIdAndUpdate(
      projectId,
      {
        $inc: { 
          currentFunding: amount,
          contributorsCount: 1  // Increment unique contributor count
        }
      },
      { new: true, runValidators: true }
    )
    .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
    .exec();

  if (!updatedProject) {
    throw new NotFoundException('Project not found after contribution');
  }

  this.logger.log(`✅ Project stats updated: 
    - Current Funding: ${updatedProject.currentFunding} MATIC
    - Contributors: ${updatedProject.contributorsCount}
    - Progress: ${((updatedProject.currentFunding / updatedProject.fundingGoal) * 100).toFixed(1)}%
  `);

  return updatedProject;
}

  async findVerifiedProjects(category?: string, location?: string): Promise<ProjectDocument[]> {
    const query: any = { status: 'active' };
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    return this.projectModel
      .find(query)
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async addToFavorites(userId: string, projectId: string): Promise<{ message: string }> {
    await this.findOne(projectId);
    const existing = await this.favoriteModel.findOne({ user: new Types.ObjectId(userId), project: new Types.ObjectId(projectId) });
    if (existing) return { message: 'Already in favorites' };
    await this.favoriteModel.create({ user: new Types.ObjectId(userId), project: new Types.ObjectId(projectId) });
    return { message: 'Added to favorites' };
  }

  async removeFromFavorites(userId: string, projectId: string): Promise<{ message: string }> {
    await this.favoriteModel.deleteOne({ user: new Types.ObjectId(userId), project: new Types.ObjectId(projectId) });
    return { message: 'Removed from favorites' };
  }

  // ✅ FIXED
  async getFavorites(userId: string): Promise<ProjectDocument[]> {
    const favorites = await this.favoriteModel
      .find({ user: new Types.ObjectId(userId) })
      .populate({ path: 'project', populate: { path: 'farmer', select: 'firstName lastName email phoneNumber location profileImage' } })
      .exec();
    return favorites.filter(fav => fav.project != null).map(fav => fav.project) as unknown as ProjectDocument[];
  }

  async isFavorite(userId: string, projectId: string): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({ user: new Types.ObjectId(userId), project: new Types.ObjectId(projectId) });
    return !!favorite;
  }

  async getStats(): Promise<any> {
    const totalProjects = await this.projectModel.countDocuments();
    const activeProjects = await this.projectModel.countDocuments({ status: 'active' });
    const completedProjects = await this.projectModel.countDocuments({ status: 'closed' });
    const fundingAgg = await this.projectModel.aggregate([
      { $match: { status: { $in: ['active', 'closed'] } } },
      { $group: { _id: null, totalFunding: { $sum: '$currentFunding' } } },
    ]);
    return { totalProjects, activeProjects, completedProjects, totalFunding: fundingAgg[0]?.totalFunding || 0 };
  }

  // ✅ NEW METHODS
  async updateProjectDepartment(projectId: string, department: GovernmentDepartment): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(projectId, { $set: { department } }, { new: true, runValidators: true })
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    this.logger.log(`✅ Project ${projectId} department updated to ${department}`);
    return project;
  }

  async findByDepartment(department: GovernmentDepartment): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ department })
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllProjectsForGovernment(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find()
      .populate('farmer', 'firstName lastName email phoneNumber location profileImage')
      .populate('dueDiligence.assignedTo', 'firstName lastName email department')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async syncBlockchainStatus(projectId: string): Promise<void> {
    const project = await this.findOne(projectId);
    if (!project.blockchainProjectId && project.blockchainProjectId !== 0) return;

    try {
      const blockchainInfo = await this.blockchainService.getProjectInfo(project.blockchainProjectId);
      const updates: any = {};
      const totalFunding = parseFloat(blockchainInfo.totalFunding.toString());

      if (totalFunding !== project.currentFunding) updates.currentFunding = totalFunding;
      if (blockchainInfo.isCompleted && project.status !== 'closed') {
        updates.status = 'closed';
        updates.completedAt = new Date();
      }

      if (Object.keys(updates).length > 0) {
        await this.projectModel.findByIdAndUpdate(projectId, updates, { runValidators: true });
        this.logger.log(`Synced blockchain status for project ${projectId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync blockchain status:`, error);
    }
  }

  async getBlockchainStatus(projectId: string): Promise<any> {
    const project = await this.findOne(projectId);
    if (!project.blockchainProjectId && project.blockchainProjectId !== 0) {
      return { blockchainEnabled: false, message: 'Project not on blockchain' };
    }

    try {
      const blockchainInfo = await this.blockchainService.getProjectInfo(project.blockchainProjectId);
      return {
        blockchainEnabled: true,
        projectId: project.blockchainProjectId,
        isFunded: blockchainInfo.totalFunding >= blockchainInfo.fundingGoal,
        isCompleted: blockchainInfo.isCompleted,
        totalFunding: parseFloat(blockchainInfo.totalFunding.toString()),
        fundingGoal: parseFloat(blockchainInfo.fundingGoal.toString()),
        localFunding: project.currentFunding,
        localStatus: project.status,
        blockchainStatus: project.blockchainStatus
      };
    } catch (error) {
      this.logger.error(`Failed to fetch blockchain status:`, error);
      return {
        blockchainEnabled: true,
        projectId: project.blockchainProjectId,
        error: 'Failed to fetch blockchain status',
        localFunding: project.currentFunding,
        localStatus: project.status,
        blockchainStatus: project.blockchainStatus
      };
    }
  }

  private createDocumentHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  
}