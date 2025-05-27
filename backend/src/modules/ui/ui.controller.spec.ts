import { Test, TestingModule } from '@nestjs/testing';
import { UiController } from './ui.controller';
import { UiService } from './ui.service';

describe('UiController', () => {
  let controller: UiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UiController],
      providers: [UiService],
    }).compile();

    controller = module.get<UiController>(UiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
