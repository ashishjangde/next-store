import { Module } from '@nestjs/common';
import { PrismaModule } from './common/db/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SessionModule } from './modules/session/session.module';
import { RedisModule } from './common/db/redis/redis.module';
import { AddressModule } from './modules/address/address.module';
import { WhishlistModule } from './modules/whishlist/whishlist.module';
import { CartModule } from './modules/cart/cart.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { VendorModule } from './modules/vendor/vendor.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    SessionModule,
    CategoryModule,
    ProductModule,
    InventoryModule,
    CartModule,
    WhishlistModule,
    AddressModule,
    VendorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
