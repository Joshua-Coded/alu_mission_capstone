import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

// dto/create-project.dto.ts

export class ProjectDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentType: string;
}

export class CreateProjectDto {
  @ApiProperty({ 
    example: 'Organic Tomato Farming Project',
    description: 'Project title'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    example: 'Growing organic tomatoes for local market supply. This project will create jobs and provide healthy food to the community.',
    description: 'Detailed project description'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ 
    example: 5000,
    description: 'Funding goal in local currency'
  })
  @IsNumber()
  @Min(100)
  fundingGoal: number;

  @ApiProperty({ 
    example: 'crops',
    description: 'Project category'
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ 
    example: 'Nairobi, Kenya',
    description: 'Project location'
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ 
    example: '6 months',
    description: 'Project timeline'
  })
  @IsString()
  @IsNotEmpty()
  timeline: string;

  @ApiPropertyOptional({ 
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Project images URLs'
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({
    type: [ProjectDocumentDto],
    description: 'Supporting documents'
  })
  @IsOptional()
  @IsArray()
  documents?: ProjectDocumentDto[];
}