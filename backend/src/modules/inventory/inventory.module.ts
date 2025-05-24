import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from 'src/repositories/inventory-repository';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';
import { RedisModule } from 'src/common/db/redis/redis.module';
import { ProductRepository } from 'src/repositories/product-repository';
import { VendorRepositories } from 'src/repositories/vendor-repositories';

@Module({
  imports: [
    PrismaModule,
    RedisModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, ProductRepository, VendorRepositories],
  exports: [InventoryService, InventoryRepository]
})
export class InventoryModule {}
