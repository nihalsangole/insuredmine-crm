import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SwaggerModule } from './swagger/swagger.module';
import { UserModule } from './user/user.module';
import { AgentModule } from './agent/agent.module';
import { PolicyModule } from './policy/policy.module';
import { PolicyCarrierModule } from './policy-carrier/policy-carrier.module';
import { PolicyCategoryModule } from './policy-category/policy-category.module';
import { MessageModule } from './message/message.module';
import { AccountModule } from './account/account.module';
import { PolicyCatrgoryController } from './policy-catrgory/policy-catrgory.controller';

@Module({
  imports: [SwaggerModule, UserModule, AgentModule, PolicyModule, PolicyCarrierModule, PolicyCategoryModule, MessageModule, AccountModule],
  controllers: [AppController, PolicyCatrgoryController],
  providers: [AppService],
})
export class AppModule {}
