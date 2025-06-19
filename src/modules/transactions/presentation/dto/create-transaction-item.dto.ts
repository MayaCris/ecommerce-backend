import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsUUID } from 'class-validator';

/**
 * DTO for creating a new transaction item
 */
export class CreateTransactionItemDto {
  @ApiProperty({
    description: 'Transaction ID that this item belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsUUID()
  transactionId: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the product',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Total price for this item (quantity * unit price)',
    example: 51.98,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalPrice: number;
}
