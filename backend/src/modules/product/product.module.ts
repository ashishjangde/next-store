import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from '../../repositories/product-repository';
import { PrismaModule } from '../../common/db/prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    PrismaModule,
    InventoryModule, // Import InventoryModule to use InventoryService
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService], // Export ProductService for use in other modules if needed
})
export class ProductModule {}
