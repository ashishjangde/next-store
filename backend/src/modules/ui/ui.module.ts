import { Module } from '@nestjs/common';
import { UiService } from './ui.service';
import { UiController } from './ui.controller';

@Module({
  controllers: [UiController],
  providers: [UiService],
})
export class UiModule {}
