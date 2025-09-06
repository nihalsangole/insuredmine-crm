import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyCategoryController } from './policy-category.controller';
import { PolicyCategoryService } from './policy-category.service';
import { PolicyCategory, PolicyCategorySchema } from './policy-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PolicyCategory.name, schema: PolicyCategorySchema },
    ]),
  ],
  controllers: [PolicyCategoryController],
  providers: [PolicyCategoryService],
  exports: [PolicyCategoryService],
})
export class PolicyCategoryModule {}
