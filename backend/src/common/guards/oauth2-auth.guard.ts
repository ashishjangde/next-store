import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OAuth2AuthGuard extends AuthGuard('oauth2') {}
