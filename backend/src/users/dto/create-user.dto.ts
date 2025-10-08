import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../../common/enums/user-role.enum";

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;

  @IsString()
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString()
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsString()
  @Matches(/^\+250\d{9}$/, { 
    message: 'Phone number must be in valid Rwandan format (+250xxxxxxxxx)' 
  })
  phoneNumber: string;

  @IsEnum(UserRole, { message: 'Role must be one of: FARMER, INVESTOR, GOVERNMENT_OFFICIAL, ADMIN' })
  role: UserRole;

  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { 
    message: 'Invalid Ethereum address format' 
  })
  walletAddress?: string;

  @IsOptional()
  @IsString()
  mobileMoneyAccount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}