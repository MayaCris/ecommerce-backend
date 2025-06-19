import { ApiProperty } from '@nestjs/swagger';

export class DeliveryAddressResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the delivery address',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer ID who owns this address',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  customerId: string;

  @ApiProperty({
    description: 'Street address',
    example: 'Carrera 15 #123-45',
  })
  streetAddress: string;

  @ApiProperty({
    description: 'City name',
    example: 'Bogotá',
  })
  city: string;

  @ApiProperty({
    description: 'State or department',
    example: 'Cundinamarca',
  })
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '110111',
  })
  postalCode: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Colombia',
  })
  country: string;

  @ApiProperty({
    description: 'Additional information or delivery instructions',
    example: 'Apartment 501, ring the doorbell twice',
    nullable: true,
  })
  additionalInfo: string | null;

  @ApiProperty({
    description: 'Whether this is the default address for the customer',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Address creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}
