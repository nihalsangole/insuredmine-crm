import { PartialType } from '@nestjs/swagger';
import { CreatePolicyCarrierDto } from './create-policyCarrier.dto';

export class UpdatePolicyCarrierDto extends PartialType(
  CreatePolicyCarrierDto,
) {}
