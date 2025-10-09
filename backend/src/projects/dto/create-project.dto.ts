import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ 
    example: 'Organic Tomato Farming Project',
    description: 'Project title'
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    example: 'Growing organic tomatoes for local market supply. This project will create jobs and provide healthy food to the community.',
    description: 'Detailed project description'
  })
  @IsString()
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
    description: 'Project category',
    enum: ['crops', 'livestock', 'equipment', 'irrigation', 'storage', 'other']
  })
  @IsString()
  category: string;

  @ApiProperty({ 
    example: 'Nairobi, Kenya',
    description: 'Project location'
  })
  @IsString()
  location: string;

  @ApiPropertyOptional({ 
    example: '6 months',
    description: 'Project duration'
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ 
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Project images URLs'
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({
    type: [Object],
    example: [{
      name: 'Land Title Document',
      url: 'https://example.com/land-title.pdf',
      documentType: 'land_ownership'
    }],
    description: 'Supporting documents'
  })
  @IsOptional()
  @IsArray()
  documents?: {
    name: string;
    url: string;
    documentType: string;
  }[];
}