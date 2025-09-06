import { Controller, Get, Post } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}
  @Get('cpu')
  async getCPUUsage() {
    const usage = await this.monitoringService.getCPUUsage();
    return { cpuUsage: `${usage}%` };
  }

  @Get('system')
  async getSystemInfo() {
    return await this.monitoringService.getSystemInfo();
  }

  @Post('restart')
  restartServer() {
    this.monitoringService.restartServer();
    return { message: 'Server restart initiated' };
  }
}
