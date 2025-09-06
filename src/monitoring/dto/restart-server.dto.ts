import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class RestartServerDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s\-_\.!?]+$/)
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  force?: boolean;
}
