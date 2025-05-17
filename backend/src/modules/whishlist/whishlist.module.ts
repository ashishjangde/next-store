import { Module } from '@nestjs/common';
import { WhishlistService } from './whishlist.service';
import { WhishlistController } from './whishlist.controller';
import { WishlistRepository } from 'src/repositories/wishlist-repository';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhishlistController],
  providers: [WhishlistService, WishlistRepository],
})
export class WhishlistModule {}
