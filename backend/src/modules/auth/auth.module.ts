import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { EmailService } from 'src/common/utils/email.service';
import { UserRepositories } from 'src/repositories/user-repositories';
import { ConfigModule } from 'src/common/config/config.module';
import { JwtModule } from 'src/common/jwt/jwt.module';
import { SessionRepositories } from 'src/repositories/session-repositories';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { GithubStrategy } from 'src/strategies/github.strategy';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule, 
    StorageModule,
    ConfigModule,
    JwtModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    EmailService, 
    UserRepositories,
    SessionRepositories,
    GoogleStrategy,
    GithubStrategy,
    JwtStrategy
  ],
})
export class AuthModule {}
