import { Test, TestingModule } from '@nestjs/testing';
import { PolicyCarrierController } from './policy-carrier.controller';

describe('PolicyCarrierController', () => {
  let controller: PolicyCarrierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolicyCarrierController],
    }).compile();

    controller = module.get<PolicyCarrierController>(PolicyCarrierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
