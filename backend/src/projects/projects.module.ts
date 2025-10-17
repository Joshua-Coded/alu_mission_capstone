import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BlockchainModule } from "../blockchain/blockchain.module";
import { User, UserSchema } from "../users/schemas/user.schema";
import { UsersModule } from "../users/users.module";
import { ProjectAssignmentService } from "./project-assignment.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { Contribution, ContributionSchema } from "./schemas/contribution.schema";
import { Favorite, FavoriteSchema } from "./schemas/favorite.schema";
import { Project, ProjectSchema } from "./schemas/project.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Contribution.name, schema: ContributionSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    BlockchainModule, 
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectAssignmentService], 
  exports: [ProjectsService, ProjectAssignmentService], 
})
export class ProjectsModule {}