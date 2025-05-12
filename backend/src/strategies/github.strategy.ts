import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import ConfigService from 'src/common/config/config.service';
import { UserRepositories } from 'src/repositories/user-repositories';
import { Roles } from '@prisma/client';
import { hashPassword } from 'src/common/utils/password.utils';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(
    configService: ConfigService,
    private userRepositories: UserRepositories,
  ) {
    const clientID = configService.get('GITHUB_CLIENT_ID');
    const clientSecret = configService.get('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('GitHub OAuth configuration is incomplete');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
      passReqToCallback: true
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: any) {
    try {
      const { username, displayName, emails, photos } = profile;

      if (!username) {
        throw new UnauthorizedException('No username provided from GitHub');
      }

      // GitHub may not provide email based on user privacy settings
      const email = emails && emails.length > 0 ? emails[0].value : `${username}@github.com`;
      const name = displayName || username;
      const profile_picture = photos && photos.length > 0 ? photos[0].value : null;

      let user = await this.userRepositories.findUserByEmail(email);

      if (!user) {
        const password = await hashPassword(Math.random().toString(36).slice(-10));
        
        user = await this.userRepositories.createUser({
          email,
          name,
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
      this.logger.error(`Error in GitHub strategy validation: ${error.message}`, error.stack);
      throw new UnauthorizedException(
        error.message || 'Failed to authenticate with GitHub'
      );
    }
  }
}
