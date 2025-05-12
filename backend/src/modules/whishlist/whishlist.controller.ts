import { Controller } from '@nestjs/common';
import { WhishlistService } from './whishlist.service';

@Controller('whishlist')
export class WhishlistController {
  constructor(private readonly whishlistService: WhishlistService) {}
}
