import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Error details (only present when success is false)',
    required: false,
  })
  error?: any;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2025-06-16T12:00:00.000Z',
  })
  timestamp: string;
}
