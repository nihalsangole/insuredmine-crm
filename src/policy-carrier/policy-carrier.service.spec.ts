import { Test, TestingModule } from '@nestjs/testing';
import { PolicyCarrierService } from './policy-carrier.service';

describe('PolicyCarrierService', () => {
  let service: PolicyCarrierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolicyCarrierService],
    }).compile();

    service = module.get<PolicyCarrierService>(PolicyCarrierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
