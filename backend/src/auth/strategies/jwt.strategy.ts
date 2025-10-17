import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
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
    
    // ✅ FIXED: No database lookup - just validate the JWT payload
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token: missing required fields');
    }

    console.log('✅ JWT Validation Successful (No DB lookup)');

    // ✅ Return the payload directly - no database query
    return {
      userId: payload.sub, // Use sub as userId
      email: payload.email,
      role: payload.role,
      // Add any other fields from the original JWT payload
      iat: payload.iat,
      exp: payload.exp
    };
  }
}