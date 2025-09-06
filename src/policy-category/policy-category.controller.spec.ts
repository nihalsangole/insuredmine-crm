import { Test, TestingModule } from '@nestjs/testing';
import { PolicyCategoryController } from './policy-category.controller';

describe('PolicyCategoryController', () => {
  let controller: PolicyCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolicyCategoryController],
    }).compile();

    controller = module.get<PolicyCategoryController>(PolicyCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
