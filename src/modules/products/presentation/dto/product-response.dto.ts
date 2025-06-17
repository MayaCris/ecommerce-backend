import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Smartphone Premium',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest generation smartphone with advanced features',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 899.99,
    minimum: 0,
  })
  price: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 25,
    minimum: 0,
  })
  stockQuantity: number;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'PHONE-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/smartphone.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2025-06-16T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2025-06-16T12:00:00.000Z',
  })
  updatedAt: string;
}
