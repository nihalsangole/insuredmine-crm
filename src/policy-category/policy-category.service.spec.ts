import { Test, TestingModule } from '@nestjs/testing';
import { PolicyCategoryService } from './policy-category.service';

describe('PolicyCategoryService', () => {
  let service: PolicyCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolicyCategoryService],
    }).compile();

    service = module.get<PolicyCategoryService>(PolicyCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
