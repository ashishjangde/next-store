import { Module } from '@nestjs/common';
import { WhishlistService } from './whishlist.service';
import { WhishlistController } from './whishlist.controller';

@Module({
  controllers: [WhishlistController],
  providers: [WhishlistService],
})
export class WhishlistModule {}
