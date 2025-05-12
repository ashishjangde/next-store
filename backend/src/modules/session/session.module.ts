import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepositories } from 'src/repositories/session-repositories';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionController],
  providers: [SessionService, SessionRepositories],
  exports: [SessionService],
})
export class SessionModule {}