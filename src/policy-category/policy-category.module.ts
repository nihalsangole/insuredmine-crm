import { Module } from '@nestjs/common';
import { PolicyCategoryController } from './policy-category.controller';
import { PolicyCategoryService } from './policy-category.service';

@Module({
  controllers: [PolicyCategoryController],
  providers: [PolicyCategoryService]
})
export class PolicyCategoryModule {}
