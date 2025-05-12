import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepositories } from 'src/repositories/user-repositories';
import ConfigService from 'src/common/config/config.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private userRepositories: UserRepositories,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        // First try to extract from cookie
        if (req?.cookies?.access_token) {
          return req.cookies.access_token;
        }
        // Fallback to Authorization header
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepositories.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
