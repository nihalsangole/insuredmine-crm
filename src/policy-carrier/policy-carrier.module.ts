import { Module } from '@nestjs/common';
import { PolicyCarrierController } from './policy-carrier.controller';
import { PolicyCarrierService } from './policy-carrier.service';

@Module({
  controllers: [PolicyCarrierController],
  providers: [PolicyCarrierService]
})
export class PolicyCarrierModule {}
