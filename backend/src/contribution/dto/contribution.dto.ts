import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "../schemas/withdrawal.schema";

import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsPositive, 
  IsEthereumAddress, 
  IsOptional,
  Min,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';

// ==================== CONTRIBUTION DTOs ====================

export class CreateContributionDto {
  @ApiProperty({ 
    description: 'Project MongoDB ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({ 
    description: 'Blockchain project ID',
    example: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  blockchainProjectId: number;

  @ApiProperty({ 
    description: 'Contribution amount in ETH',
    example: 0.1,
    minimum: 0.001
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0.001)
  amountEth: number;

  @ApiProperty({ 
    description: 'Contributor wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  })
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  contributorWallet: string;

  @ApiPropertyOptional({ 
    description: 'Transaction hash (if already submitted on blockchain)',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes',
    example: 'Supporting local agriculture'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmContributionDto {
  @ApiProperty({ 
    description: 'Blockchain transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  @IsNotEmpty()
  @IsString()
  transactionHash: string;

  @ApiProperty({ 
    description: 'Block number',
    example: 12345678
  })
  @IsNotEmpty()
  @IsNumber()
  blockNumber: number;

  @ApiPropertyOptional({ 
    description: 'Gas used',
    example: '21000'
  })
  @IsOptional()
  @IsString()
  gasUsed?: string;
}

export class GetContributionsQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by status',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'failed']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by project ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ 
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ 
    description: 'Items per page',
    example: 10,
    default: 10,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

// ==================== WITHDRAWAL DTOs ====================

export class CreateWithdrawalDto {
  @ApiProperty({ 
    description: 'Project MongoDB ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({ 
    description: 'Blockchain project ID',
    example: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  blockchainProjectId: number;

  @ApiProperty({ 
    description: 'Farmer wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  })
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  farmerWallet: string;

  @ApiProperty({ 
    description: 'Payment method',
    enum: ['mobile_money', 'bank_transfer'],
    example: 'mobile_money'
  })
  @IsNotEmpty()
  @IsEnum(['mobile_money', 'bank_transfer'])
  paymentMethod: 'mobile_money' | 'bank_transfer';

  @ApiProperty({ 
    description: 'Recipient phone number (for mobile money)',
    example: '+250788123456'
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('RW')
  recipientPhone: string;

  @ApiPropertyOptional({ 
    description: 'Bank account number (for bank transfer)',
    example: '1234567890'
  })
  @IsOptional()
  @IsString()
  recipientBankAccount?: string;

  @ApiPropertyOptional({ 
    description: 'Bank name',
    example: 'Bank of Kigali'
  })
  @IsOptional()
  @IsString()
  recipientBankName?: string;

  @ApiPropertyOptional({ 
    description: 'Recipient full name',
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessWithdrawalDto {
  @ApiProperty({ 
    description: 'Payment reference number',
    example: 'MTN-123456789'
  })
  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @ApiPropertyOptional({ 
    description: 'Blockchain transaction hash (if project completion)',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString()
  blockchainTxHash?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ==================== RESPONSE DTOs ====================

export class ContributionResponseDto {
  @ApiProperty({ description: 'Contribution ID' })
  id: string;

  @ApiProperty({ description: 'Project ID' })
  projectId: string;

  @ApiProperty({ description: 'Contributor user ID' })
  contributorId: string;

  @ApiProperty({ description: 'Amount contributed in ETH' })
  amountEth: number;

  @ApiProperty({ description: 'Blockchain transaction hash' })
  transactionHash: string;

  @ApiProperty({ description: 'Blockchain project ID' })
  blockchainProjectId: number;

  @ApiProperty({ description: 'Contribution status' })
  status: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;
}