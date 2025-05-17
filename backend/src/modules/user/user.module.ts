import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { UserRepositories } from 'src/repositories/user-repositories';
import { SessionRepositories } from 'src/repositories/session-repositories';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';
import { JwtModule } from 'src/common/jwt/jwt.module';

@Module({
  imports: [PrismaModule, StorageModule, JwtModule],
  controllers: [UserController],
  providers: [UserService, UserRepositories, SessionRepositories, MulterS3ConfigService],
})
export class UserModule {}
