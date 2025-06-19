import { ApiProperty } from '@nestjs/swagger';

/**
 * Transaction Item Response DTO
 * Used for API responses - contains only the data we want to expose
 */
export class TransactionItemResponseDto {
  @ApiProperty({
    description: 'Transaction item unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction ID that this item belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the product',
    example: 25.99,
    minimum: 0,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Total price for this item (quantity * unit price)',
    example: 51.98,
    minimum: 0,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Transaction item creation date',
    example: '2025-06-17T12:00:00Z',
  })
  createdAt: Date;
}
