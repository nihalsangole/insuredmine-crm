import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyCarrierController } from './policy-carrier.controller';
import { PolicyCarrierService } from './policy-carrier.service';
import { PolicyCarrier, PolicyCarrierSchema } from './policy-carrier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PolicyCarrier.name, schema: PolicyCarrierSchema },
    ]),
  ],
  controllers: [PolicyCarrierController],
  providers: [PolicyCarrierService],
  exports: [PolicyCarrierService],
})
export class PolicyCarrierModule {}
