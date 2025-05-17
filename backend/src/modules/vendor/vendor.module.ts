import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { VendorRepositories } from 'src/repositories/vendor-repositories';
import { UserRepositories } from 'src/repositories/user-repositories';
import { RedisService } from 'src/common/db/redis/redis.service';

@Module({
  controllers: [VendorController],
  providers: [
    VendorService, 
    VendorRepositories, 
    UserRepositories, 
    PrismaService, 
    RedisService
  ],
  exports: [VendorService],
})
export class VendorModule {}
