import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import { Model } from "mongoose";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Project, ProjectDocument } from "./schemas/project.schema";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  // ==================== FARMER METHODS ====================

  async create(createProjectDto: CreateProjectDto, farmerId: string): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...createProjectDto,
      projectId: randomUUID(),
      farmer: farmerId,
      status: 'draft',
      currentFunding: 0,
      contributorsCount: 0,
      dueDiligence: {
        status: 'pending',
        notes: '',
        documents: [],
      },
      verification: {},
    });

    return project.save();
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

  // ==================== GOVERNMENT METHODS ====================

  async findPendingProjects(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ status: 'submitted' })
      .populate('farmer', 'firstName lastName email phoneNumber location')
      .sort({ createdAt: 1 })
      .exec();
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