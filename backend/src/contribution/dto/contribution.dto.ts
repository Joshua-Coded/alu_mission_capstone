import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsEnum,
  Min,
  IsBoolean,
  IsIn
} from 'class-validator';

export class CreateContributionDto {
  @ApiProperty({
    example: 'proj_123456',
    description: 'Project ID to contribute to'
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    example: 10,
    description: 'Contribution amount in MATIC (any amount, no minimum)',
    minimum: 0.001
  })
  @IsNumber()
  @Min(0.001, { message: 'Minimum contribution is 0.001 MATIC' })
  amount: number;

  @ApiProperty({
    example: 'MATIC',
    description: 'Currency - Only MATIC supported on Polygon'
  })
  @IsString()
  @IsOptional()
  @IsIn(['MATIC'], { message: 'Only MATIC currency is supported' })
  currency?: string;

  @ApiProperty({
    example: 'blockchain',
    description: 'Payment method - must be blockchain'
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['blockchain'], { message: 'Only blockchain payment method is supported' })
  paymentMethod: string;

  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Polygon transaction hash from MetaMask'
  })
  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  // ✅ ADD THIS FIELD
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    description: 'Contributor wallet address from MetaMask'
  })
  @IsString()
  @IsNotEmpty()
  contributorWallet: string;

  @ApiPropertyOptional({
    example: {
      anonymous: false,
      message: 'Supporting local farmers!'
    },
    description: 'Additional metadata'
  })
  @IsOptional()
  metadata?: {
    anonymous?: boolean;
    message?: string;
  };
}

export class ConfirmContributionDto {
  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Blockchain transaction hash'
  })
  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}

export class GetContributionsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number'
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page'
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'confirmed',
    description: 'Filter by status'
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'proj_123456',
    description: 'Filter by project ID'
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}