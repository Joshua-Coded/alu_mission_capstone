import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

// src/projects/dto/update-due-diligence.dto.ts

export class UpdateDueDiligenceDto {
  @ApiPropertyOptional({ example: 'Verified all documents. Land title is authentic.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: [Object],
    example: [{
      name: 'Verification Report',
      url: 'https://cloudinary.com/report.pdf'
    }]
  })
  @IsOptional()
  @IsArray()
  documents?: {
    name: string;
    url: string;
  }[];

  @ApiPropertyOptional({ 
    example: 'in_progress', 
    enum: ['pending', 'in_progress', 'completed'] 
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: string;
}