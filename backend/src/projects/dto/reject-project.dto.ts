import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

// src/projects/dto/reject-project.dto.ts

export class RejectProjectDto {
  @ApiProperty({ example: 'Incomplete documentation. Missing land ownership proof.' })
  @IsString()
  reason: string;
}