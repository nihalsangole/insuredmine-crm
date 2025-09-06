import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

// maybe add more validation later

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  message: string; // this is the mesage content

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string; // this is when the mesage should be sent

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId?: string; // this is optinal

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  priority?: number; // priorty level (1-5)
}
