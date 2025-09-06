import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SchedulerService } from './scheduler.service';

@ApiTags('Message Management')
@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Post('schedule')
  async scheduleMessage(@Body() createMessageDto: CreateMessageDto) {
    const { message, scheduledTime, userId } = createMessageDto;

    // convert scheduledTime string to Date
    const scheduledDate = new Date(scheduledTime);

    return this.messageService.scheduleMessage(message, scheduledDate, userId);
  }

  @Post('schedule-legacy')
  async scheduleMessageLegacy(
    @Body() body: { message: string; day: string; time: string },
  ) {
    const { message, day, time } = body;
    return this.messageService.scheduleMessageLegacy(message, day, time);
  }

  @Get('scheduled')
  async getAllScheduledMessages() {
    return this.messageService.getAllScheduledMessages();
  }

  @Get('scheduled/:id')
  async getScheduledMessageById(@Param('id') id: string) {
    return this.messageService.getScheduledMessageById(id);
  }

  @Patch('scheduled/:id')
  async updateScheduledMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.updateScheduledMessage(id, updateMessageDto);
  }

  @Delete('scheduled/:id')
  async cancelScheduledMessage(@Param('id') id: string) {
    return this.messageService.cancelScheduledMessage(id);
  }

  @Delete('scheduled/:id/delete')
  async deleteScheduledMessage(@Param('id') id: string) {
    return this.messageService.deleteScheduledMessage(id);
  }

  @Get('main')
  async getAllMessages() {
    return this.messageService.getAllMessages();
  }

  @Get('main/:id')
  async getMessageById(@Param('id') id: string) {
    return this.messageService.getMessageById(id);
  }

  @Get('logs')
  async getJobLogs(
    @Query('jobType') jobType?: string,
    @Query('limit') limit?: number,
  ) {
    return this.messageService.getJobLogs(jobType, limit);
  }

  @Post('trigger-cron')
  async triggerCronJob() {
    return this.messageService.triggerCronJob();
  }

  @Get('stats')
  async getMessageStats() {
    return this.messageService.getMessageStats();
  }

  @Post('retry-failed')
  async retryFailedMessages() {
    return this.messageService.retryFailedMessages();
  }

  @Post('trigger-scheduler')
  @ApiOperation({
    summary: 'Manually trigger the scheduler to check for upcoming messages',
  })
  async triggerScheduler() {
    return this.schedulerService.triggerScheduler();
  }

  @Get('scheduler-stats')
  @ApiOperation({ summary: 'Get scheduler statistics' })
  async getSchedulerStats() {
    return this.schedulerService.getSchedulerStats();
  }
}
