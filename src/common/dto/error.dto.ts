import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  value: any;
}

export class ErrorResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string | string[];

  @ApiProperty()
  error: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ required: false, type: [ValidationErrorDto] })
  details?: ValidationErrorDto[];
}