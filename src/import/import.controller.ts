import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ImportService } from './import.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    // save file to disk manually if needed
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    const filePath = path.join(uploadDir, `${Date.now()}_${file.originalname}`);
    fs.writeFileSync(filePath, file.buffer);

    try {
      const result = await this.importService.processFile(filePath);
      return { success: true, message: 'File imported successfully', result };
    } catch (error) {
      return { success: false, message: 'Import failed', error: error.message };
    }
  }
}
