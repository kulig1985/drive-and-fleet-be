import { Test, TestingModule } from '@nestjs/testing';
import { ConfigHandlerService } from './config-handler.service';

describe('ConfigHandlerService', () => {
  let service: ConfigHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigHandlerService],
    }).compile();

    service = module.get<ConfigHandlerService>(ConfigHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
