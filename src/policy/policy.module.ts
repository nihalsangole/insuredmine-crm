import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { PolicyInfo, PolicyInfoSchema } from './policy.schema';
import { User, UserScheme } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PolicyInfo.name, schema: PolicyInfoSchema },
      { name: User.name, schema: UserScheme },
    ]),
  ],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
