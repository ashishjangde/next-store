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
import { AttributeModule } from './modules/attribute/attribute.module';
import { GeneralModule } from './modules/general/general.module';
import { UiModule } from './modules/ui/ui.module';
import { BannersModule } from './modules/banners/banners.module';
import { PromotionsModule } from './modules/promotions/promotions.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    SessionModule,
    CategoryModule,
    AttributeModule,
    ProductModule,
    InventoryModule,
    CartModule,
    WhishlistModule,
    AddressModule,
    VendorModule,
    GeneralModule,
    BannersModule,
    UiModule,
    PromotionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
