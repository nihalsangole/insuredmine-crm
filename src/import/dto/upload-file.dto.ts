import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['csv', 'xlsx', 'xls'])
  fileType: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s\-_\.]+\.(csv|xlsx|xls)$/)
  fileName: string;
}