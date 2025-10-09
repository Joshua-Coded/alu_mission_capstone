import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

// src/projects/dto/verify-project.dto.ts

export class VerifyProjectDto {
  @ApiPropertyOptional({ example: 'Project verified and approved for funding' })
  @IsOptional()
  @IsString()
  notes?: string;
}