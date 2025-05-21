import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { AttributeRepository } from 'src/repositories/attribute-repository';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';
import { RedisModule } from 'src/common/db/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule
  ],
  controllers: [AttributeController],
  providers: [AttributeService, AttributeRepository],
  exports: [AttributeService, AttributeRepository]
})
export class AttributeModule {}
