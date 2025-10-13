import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../../users/users.service";

// src/auth/strategies/jwt.strategy.ts - COMPLETE FIX

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT Validation - Payload:', payload);
    
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user ID');
    }

    try {
      // ✅ Properly handle the null case
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        console.error('❌ User not found for ID:', payload.sub);
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        console.error('❌ User account deactivated:', payload.sub);
        throw new UnauthorizedException('Account is deactivated');
      }

      // ✅ Safe extraction of user ID - Mongoose documents always have _id
      const userId = (user as any)._id?.toString?.();
      
      if (!userId) {
        console.error('❌ Could not extract user ID from user object');
        throw new UnauthorizedException('Invalid user data');
      }

      console.log('✅ JWT Validation Successful:', {
        userId,
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      });

      // ✅ Return the exact format your controller expects
      return {
        userId: userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
    } catch (error) {
      console.error('❌ JWT Validation Error:', error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Authentication failed');
    }
  }
}