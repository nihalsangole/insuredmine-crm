import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';
import * as path from 'path';

@Injectable()
export class ImportService {
  async processFile(filePath: string) {
    // using worker threads to process files in bg - need to do this async
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'import.worker.js'), {
        workerData: { filePath },
      } as any);
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}
