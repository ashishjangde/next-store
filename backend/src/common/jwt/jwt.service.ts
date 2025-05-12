import { Injectable, Logger } from '@nestjs/common';
import { Users } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import ConfigService from '../config/config.service';

interface RefreshTokenPayload {
  id: string;
}

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);

  constructor(private readonly configService: ConfigService) {
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    
    if (!accessSecret || !refreshSecret) {
      this.logger.error('JWT secrets not configured properly');
      throw new Error('JWT configuration missing');
    }
  }

  CreateAccessToken(user: Users): string {
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      name: user.name,
      username: user.username,
      profile_picture: user.profile_picture,
      is_verified: user.is_verified,
      account_status: user.account_status
    };

    try {
      return jwt.sign(payload, this.configService.get('JWT_ACCESS_SECRET'), {
        expiresIn: '10m'
      });
    } catch (error) {
      this.logger.error(`Error signing access token: ${error.message}`);
      throw error;
    }
  }

  CreateRefreshToken(userId: string): { token: string; expiresAt: Date } {
    const payload: RefreshTokenPayload = { id: userId };
    const expiresIn = '9M';

    try {
      const token = jwt.sign(payload, this.configService.get('JWT_REFRESH_SECRET'), {
        expiresIn
      });

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 9);

      return { token, expiresAt };
    } catch (error) {
      this.logger.error(`Error signing refresh token: ${error.message}`);
      throw error;
    }
  }

  ValidateAccessToken(token: string) {
    try {
      return jwt.verify(token, this.configService.get('JWT_ACCESS_SECRET'));
    } catch (error) {
      this.logger.error(`Error validating access token: ${error.message}`);
      return null;
    }
  }

  ValidateRefreshToken(token: string) {
    try {
      return jwt.verify(token, this.configService.get('JWT_REFRESH_SECRET'));
    } catch (error) {
      this.logger.error(`Error validating refresh token: ${error.message}`);
      return null;
    }
  }
}