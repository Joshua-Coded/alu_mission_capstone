import { 
    IsEmail, 
    IsString, 
    IsNotEmpty, 
    IsOptional, 
    IsBoolean, 
    MinLength, 
    Matches, 
    IsEnum,
    IsArray,
    ValidateIf,
    ArrayMinSize
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { UserRole, GovernmentDepartment, ProjectCategory } from '../../common/enums/user-role.enum';
  
  export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @IsString()
    @IsNotEmpty()
    lastName: string;
  
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[\d\s-()]{10,15}$/, { message: 'Invalid phone format' })
    phoneNumber: string;
  
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: 'Password must contain uppercase, lowercase, number, and special character'
    })
    password: string;
  
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
  
    @IsBoolean()
    @IsNotEmpty()
    termsAccepted: boolean;
  
    // Common optional fields
    @IsOptional()
    @IsString()
    location?: string;
  
    @IsOptional()
    @IsString()
    bio?: string;
  
    @IsOptional()
    @IsString()
    @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' })
    walletAddress?: string;
  
    @IsOptional()
    @IsString()
    mobileMoneyAccount?: string;
  
    // Government Official specific fields
    @ValidateIf(o => o.role === UserRole.GOVERNMENT_OFFICIAL)
    @IsEnum(GovernmentDepartment)
    @IsNotEmpty({ message: 'Department is required for government officials' })
    department?: GovernmentDepartment;
  
    @ValidateIf(o => o.role === UserRole.GOVERNMENT_OFFICIAL)
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one specialization is required' })
    @IsEnum(ProjectCategory, { each: true })
    specializations?: ProjectCategory[];
  
    // Frontend validation field (not stored)
    @IsOptional()
    confirmPassword?: string;
  }