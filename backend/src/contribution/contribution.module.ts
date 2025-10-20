import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BlockchainModule } from "../blockchain/blockchain.module";
import { ProjectsModule } from "../projects/projects.module";
import { ContributionController } from "./contribution.controller";
import { ContributionService } from "./contribution.service";
import { Contribution, ContributionSchema } from "./schemas/contribution.schema";
import { Withdrawal, WithdrawalSchema } from "./schemas/withdrawal.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contribution.name, schema: ContributionSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
    BlockchainModule,
    ProjectsModule,
  ],
  controllers: [ContributionController],
  providers: [ContributionService],
  exports: [ContributionService],
})
export class ContributionModule {}