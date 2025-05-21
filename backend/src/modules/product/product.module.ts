import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from 'src/repositories/product-repository';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';
import { RedisModule } from 'src/common/db/redis/redis.module';
import { CategoryRepository } from 'src/repositories/category-repository';
import { InventoryRepository } from 'src/repositories/inventory-repository';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    StorageModule
  ],
  controllers: [ProductController],
  providers: [
    ProductService, 
    ProductRepository, 
    CategoryRepository,
    InventoryRepository
  ],
  exports: [ProductService, ProductRepository]
})
export class ProductModule {}