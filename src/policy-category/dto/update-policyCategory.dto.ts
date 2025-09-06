import { PartialType } from '@nestjs/swagger';
import { CreatePolicyCategoryDto } from './create-policyCategory.dto';

export class UpdatePolicyCategoryDto extends PartialType(
  CreatePolicyCategoryDto,
) {}
