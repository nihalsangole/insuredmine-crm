import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  timestamp: string;
}