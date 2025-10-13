import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { Model } from "mongoose";
import { Types } from "mongoose";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateDueDiligenceDto } from "./dto/update-due-diligence.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Favorite, FavoriteDocument } from "./schemas/favorite.schema";
import { Project, ProjectDocument } from "./schemas/project.schema";

// projects.service.ts

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
  ) {}

  // ==================== FARMER METHODS ====================

async create(createProjectDto: CreateProjectDto, farmerId: string): Promise<ProjectDocument> {
  console.log('=== PROJECT CREATION START ===');
  console.log('Farmer ID:', farmerId);
  console.log('Farmer ID type:', typeof farmerId);
  
  try {
    // ✅ Convert string farmerId to ObjectId
    const farmerObjectId = new Types.ObjectId(farmerId);
    
    console.log('Converted farmer ObjectId:', farmerObjectId);
    console.log('Is valid ObjectId?', Types.ObjectId.isValid(farmerId));

    const projectData = {
      ...createProjectDto,
      projectId: randomUUID(),
      farmer: farmerObjectId, // ✅ Use ObjectId instead of string
      status: 'draft' as const,
      currentFunding: 0,
      contributorsCount: 0,
      dueDiligence: {
        status: 'pending' as const,
        notes: '',
        documents: [],
      },
      verification: {},
    };

    console.log('Project data to save:', projectData);

    const project = new this.projectModel(projectData);
    const savedProject = await project.save();
    
    console.log('=== PROJECT CREATION SUCCESS ===');
    console.log('Saved project ID:', savedProject._id);
    
    return savedProject;
  } catch (error) {
    console.log('=== PROJECT CREATION ERROR ===');
    console.error('Error details:', error);
    
    // Handle specific Mongoose errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      console.error('Validation errors:', validationErrors);
      throw new BadRequestException(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }
    
    if (error.name === 'CastError') {
      throw new BadRequestException(`Invalid data format: ${error.message}`);
    }
    
    throw new BadRequestException(error.message || 'Internal server error');
  }
}

  async findByFarmer(farmerId: string, status?: string): Promise<ProjectDocument[]> {
    const query: any = { farmer: farmerId };
    
    if (status) {
      query.status = status;
    }

    return this.projectModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
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

  async submitForReview(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'submitted' } },
        { new: true }
      )
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  // ==================== GOVERNMENT METHODS ====================

  async findPendingProjects(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ status: 'submitted' })
      .populate('farmer', 'firstName lastName email phoneNumber location')
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

  async updateDueDiligence(
    projectId: string,
    officialId: string,
    updateDto: UpdateDueDiligenceDto,
  ): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);

    // Check if this official is assigned to this project
    if (project.dueDiligence.assignedTo?.toString() !== officialId) {
      throw new BadRequestException('You are not assigned to this project');
    }

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
      throw new NotFoundException('Project not found');
    }

    return updatedProject;
  }

  async verifyProject(projectId: string, officialId: string, notes?: string): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);

    if (project.status !== 'under_review') {
      throw new BadRequestException('Project must be under review to verify');
    }

    // Create document hash
    const documentHash = this.createDocumentHash({
      projectId: project.projectId,
      documents: project.documents,
      dueDiligenceNotes: project.dueDiligence.notes,
      verifiedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        {
          $set: {
            status: 'active',
            'verification.verifiedBy': officialId,
            'verification.verifiedAt': new Date(),
            'verification.documentHash': documentHash,
          },
        },
        { new: true }
      )
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .populate('verification.verifiedBy', 'firstName lastName email')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException('Project not found');
    }

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
      throw new NotFoundException('Project not found');
    }

    return updatedProject;
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
    const [
      totalProjects,
      activeProjects,
      fundedProjects,
      totalFunding,
      pendingReview,
    ] = await Promise.all([
      this.projectModel.countDocuments(),
      this.projectModel.countDocuments({ status: 'active' }),
      this.projectModel.countDocuments({ status: 'funded' }),
      this.projectModel.aggregate([
        { $match: { status: { $in: ['active', 'funded', 'closed'] } } },
        { $group: { _id: null, total: { $sum: '$currentFunding' } } }
      ]),
      this.projectModel.countDocuments({ status: 'submitted' }),
    ]);

    return {
      totalProjects,
      activeProjects,
      fundedProjects,
      totalFunding: totalFunding[0]?.total || 0,
      pendingReview,
    };
  }
}