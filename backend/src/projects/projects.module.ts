import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
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
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}