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
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ImportModule } from './import/import.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SwaggerModule,
    UserModule,
    AgentModule,
    PolicyModule,
    PolicyCarrierModule,
    PolicyCategoryModule,
    MessageModule,
    AccountModule,
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb://root:kalilinux@localhost:27017/crm?authSource=admin',
    ),
    ImportModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
