import { ApiProperty } from '@nestjs/swagger';

/**
 * Customer Response DTO
 * Used for API responses - contains only the data we want to expose
 */
export class CustomerResponseDto {
  @ApiProperty({
    description: 'Customer unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+57 300 123 4567',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Customer creation date',
    example: '2025-06-17T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Customer last update date',
    example: '2025-06-17T12:00:00Z',
  })
  updatedAt: Date;
}
