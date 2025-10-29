import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

// FIXED: Added enum for project categories
export enum ProjectCategory {
  POULTRY_FARMING = 'POULTRY_FARMING',
  CROP_PRODUCTION = 'CROP_PRODUCTION',
  LIVESTOCK_FARMING = 'LIVESTOCK_FARMING',
  FISH_FARMING = 'FISH_FARMING',
  VEGETABLE_FARMING = 'VEGETABLE_FARMING',
  FRUIT_FARMING = 'FRUIT_FARMING',
  AGRO_PROCESSING = 'AGRO_PROCESSING',
  SUSTAINABLE_AGRICULTURE = 'SUSTAINABLE_AGRICULTURE',
  ORGANIC_FARMING = 'ORGANIC_FARMING',
  GENERAL_AGRICULTURE = 'GENERAL_AGRICULTURE'
}

export class ProjectDocumentDto {
  @ApiProperty({ 
    example: 'Business Plan.pdf',
    description: 'Document name'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ 
    example: 'https://cloudinary.com/documents/business-plan.pdf',
    description: 'Document URL from cloud storage'
  })
  @IsString()
  @IsNotEmpty()
  url: string;
  
  @ApiProperty({ 
    example: 'business_plan',
    description: 'Document type (business_plan, financial_projection, land_ownership, etc.)'
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;
}

export class CreateProjectDto {
  @ApiProperty({
    example: 'Organic Tomato Farming Project',
    description: 'Project title (max 200 characters)'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
  
  @ApiProperty({
    example: 'Growing organic tomatoes for local market supply. This project will create jobs and provide healthy food to the community.',
    description: 'Detailed project description (max 2000 characters)'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
  
  @ApiProperty({
    example: 50,
    description: '💰 Funding goal in MATIC (Polygon cryptocurrency) - Minimum 0.1 MATIC. Example: 50 means 50 MATIC tokens.',
    minimum: 0.1,
    type: Number
  })
  @IsNumber()
  @Min(0.1, { message: 'Minimum funding goal is 0.1 MATIC' })
  fundingGoal: number;
  
  @ApiProperty({
    example: 'CROP_PRODUCTION',
    description: 'Project category',
    enum: ProjectCategory
  })
  @IsEnum(ProjectCategory)
  @IsNotEmpty()
  category: ProjectCategory;
  
  @ApiProperty({
    example: 'Kigali, Rwanda',
    description: 'Project location (city, region, or country)'
  })
  @IsString()
  @IsNotEmpty()
  location: string;
  
  @ApiProperty({
    example: '6 months',
    description: 'Project timeline (e.g., "6 months", "1 year", "90 days")'
  })
  @IsString()
  @IsNotEmpty()
  timeline: string;
  
  @ApiPropertyOptional({
    type: [String],
    example: ['https://cloudinary.com/images/project1.jpg', 'https://cloudinary.com/images/project2.jpg'],
    description: 'Project image URLs (uploaded to Cloudinary or similar)'
  })
  @IsOptional()
  @IsArray()
  images?: string[];
  
  @ApiPropertyOptional({
    type: [ProjectDocumentDto],
    description: 'Supporting documents (business plan, certifications, etc.)',
    example: [{
      name: 'Business Plan.pdf',
      url: 'https://cloudinary.com/docs/plan.pdf',
      documentType: 'business_plan'
    }]
  })
  @IsOptional()
  @IsArray()
  documents?: ProjectDocumentDto[];
  
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    description: '🔐 REQUIRED: Your Polygon wallet address (MetaMask) for receiving MATIC contributions. Must be a valid Ethereum-style address (0x...)',
    pattern: '^0x[a-fA-F0-9]{40}$'
  })
  @IsString()
  @IsNotEmpty()
  farmerWalletAddress: string;
}