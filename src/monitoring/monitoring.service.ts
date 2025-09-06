import { logger } from './../common/logger/winston';
import { Injectable, Logger } from '@nestjs/common';
import * as os from 'node-os-utils';
import * as cron from 'node-cron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  private isMonitoring = false;

  private restartThreshold = parseInt(
    process.env.CPU_RESTART_THRESHOLD || '70',
  );

  private checkInterval = parseInt(process.env.CPU_CHECK_INTERVAL || '5');

  private restartAttempts = 0;
  private maxRestartAttempts = 3;

  constructor() {
    this.startMonitoring();
  }

  startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('cpu monitoring already started, skippin..');

      return;
    }

    this.isMonitoring = true;
    this.logger.log('starting cpu monitoring');
    const cronExpression = `*/${this.checkInterval} * * * * *`;
    this.logger.log(
      `Starting CPU monitoring with ${this.checkInterval}s interval and ${this.restartThreshold}% threshold`,
    );
    cron.schedule(cronExpression, async () => {
      try {
        const cpuUsage = await os.cpu.usage();
        this.logger.debug(`current cpu usage:${cpuUsage}`);

        if (cpuUsage >= this.restartThreshold) {
          this.logger.warn(
            `CPU usage exceeded threshold: ${cpuUsage}% >= ${this.restartThreshold}%`,
          );
          if (this.restartAttempts >= this.maxRestartAttempts) {
            this.logger.error(
              'Max restart attempts reached, stopping monitoring',
            );
            return;
          }

          this.restartAttempts++;
          this.restartServer();
        }
      } catch (error) {
        this.logger.error('Error monitoring CPU:', error);
      }
    });
  }
  restartServer() {
    this.logger.warn('Initiating server restart due to high CPU usage...');

    setTimeout(() => {
      this.logger.log('Restarting server...');

      if (process.env.NODE_ENV === 'production') {
        const restartCommand =
          process.env.PROD_RESTART_COMMAND || 'pm2 restart crm-app';
        this.logger.log(`Production mode: Using command: ${restartCommand}`);

        exec(restartCommand, (error, stdout) => {
          if (error) {
            this.logger.error(`PM2 restart failed: ${error.message}`);
            this.logger.log('Falling back to process exit...');
            process.exit(1);
          } else {
            this.logger.log(`PM2 restart successful: ${stdout}`);
            process.exit(0);
          }
        });
      } else {
        this.logger.log('Development mode: Attempting to restart...');

        const stopCommand =
          process.env.DEV_STOP_COMMAND || 'pkill -f "nest start"';
        const startCommand =
          process.env.DEV_START_COMMAND || 'npm run start:dev';
        const logFile = process.env.LOG_FILE || 'server.log';

        const restartCommand = `#!/bin/bash
echo "Stopping current server..."
${stopCommand} || true
sleep 2
echo "Starting server..."
cd ${process.cwd()}
${startCommand} > ${logFile} 2>&1 &
echo "Server restart completed"
`;

        const scriptPath = path.join(process.cwd(), 'restart-temp.sh');

        try {
          fs.writeFileSync(scriptPath, restartCommand);
          fs.chmodSync(scriptPath, '755');

          exec(`bash ${scriptPath}`, (error, stdout) => {
            if (error) {
              this.logger.error(`Restart script failed: ${error.message}`);
              this.logger.log(`Manual restart required. Run: ${startCommand}`);
              process.exit(1);
            } else {
              this.logger.log(`Restart script output: ${stdout}`);
              process.exit(0);
            }
          });
        } catch (error) {
          this.logger.error(`Failed to create restart script: ${error}`);
          this.logger.log(`Manual restart required. Run: ${startCommand}`);
          process.exit(1);
        }
      }
    }, 1000);
  }

  async getCPUUsage(): Promise<number> {
    return await os.cpu.usage();
  }

  async getSystemInfo() {
    const memInfo = await os.mem.info();
    return {
      cpu: {
        usage: await os.cpu.usage(),
        count: os.cpu.count(),
      },
      memory: {
        total: memInfo.totalMemMb,
        used: memInfo.usedMemMb,
        free: memInfo.freeMemMb,
        usage: memInfo.usedMemPercentage,
      },
      uptime: os.os.uptime(),
    };
  }
}
