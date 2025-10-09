import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

// src/projects/dto/assign-due-diligence.dto.ts

export class AssignDueDiligenceDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  governmentOfficialId: string;
}