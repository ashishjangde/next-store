import { Controller } from '@nestjs/common';
import { UiService } from './ui.service';

@Controller('ui')
export class UiController {
  constructor(private readonly uiService: UiService) {}
}
