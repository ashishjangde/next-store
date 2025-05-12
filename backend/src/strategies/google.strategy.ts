import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import ConfigService from 'src/common/config/config.service';
import { UserRepositories } from 'src/repositories/user-repositories';
import { Roles } from '@prisma/client';
import { hashPassword } from 'src/common/utils/password.utils';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    configService: ConfigService,
    private userRepositories: UserRepositories,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;

      if (!emails || emails.length === 0) {
        throw new UnauthorizedException('No email provided from Google');
      }

      const email = emails[0].value;
      const displayName = name.givenName + ' ' + name.familyName;
      const username = email.split('@')[0]; // Generate username from email
      const profile_picture = photos && photos.length > 0 ? photos[0].value : null;
      let user = await this.userRepositories.findUserByEmail(email);


      if (!user) {
        const password = await hashPassword(Math.random().toString(36).slice(-10));
        
        user = await this.userRepositories.createUser({
          email,
          name: displayName,
          username,
          profile_picture,
          password,
          is_verified: true,
          roles: [Roles.USER],
        });

        if (!user) {
          throw new Error('Failed to create user');
        }
        this.logger.debug(`Created new user with ID: ${user.id}`);
      } else {
        this.logger.debug(`Found existing user with ID: ${user.id}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error in Google strategy validation: ${error.message}`, error.stack);
      throw error;
    }
  }
}
