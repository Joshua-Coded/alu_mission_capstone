import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { ProjectCategory } from "./create-project.dto";
import { ProjectDocumentDto } from "./create-project.dto";

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Updated Organic Tomato Farming Project',
    description: 'Project title (max 200 characters)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
  
  @ApiPropertyOptional({
    example: 'Updated description with more details about the farming project.',
    description: 'Project description (max 2000 characters)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
  
  @ApiPropertyOptional({
    example: 75,
    description: '💰 Updated funding goal in MATIC - Minimum 0.1 MATIC',
    minimum: 0.1,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1, { message: 'Minimum funding goal is 0.1 MATIC' })
  fundingGoal?: number;
  
  @ApiPropertyOptional({
    example: 'ORGANIC_FARMING',
    description: 'Project category',
    enum: ProjectCategory
  })
  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory;
  
  @ApiPropertyOptional({
    example: 'Kigali, Gasabo District, Rwanda',
    description: 'Updated project location'
  })
  @IsOptional()
  @IsString()
  location?: string;
  
  @ApiPropertyOptional({
    example: '8 months',
    description: 'Updated project timeline'
  })
  @IsOptional()
  @IsString()
  timeline?: string;
  
  @ApiPropertyOptional({
    type: [String],
    example: ['https://cloudinary.com/images/new-project1.jpg'],
    description: 'Updated project image URLs'
  })
  @IsOptional()
  @IsArray()
  images?: string[];
  
  @ApiPropertyOptional({
    type: [ProjectDocumentDto],
    description: 'Updated supporting documents'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDocumentDto)
  documents?: ProjectDocumentDto[];
}