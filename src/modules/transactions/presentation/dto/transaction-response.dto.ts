import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '../../../../shared/domain/enums/transaction-status.enum';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

/**
 * Transaction Response DTO
 * Used for API responses - contains only the data we want to expose
 */
export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction number (human-readable)',
    example: 'TXN-2025-001234',
  })
  transactionNumber: string;

  @ApiProperty({
    description: 'Customer ID who made the transaction',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  customerId: string;

  @ApiProperty({
    description: 'Delivery address ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  deliveryAddressId: string;

  @ApiProperty({
    description: 'Subtotal amount (before fees)',
    example: 100.5,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Base fee amount',
    example: 5,
  })
  baseFee: number;

  @ApiProperty({
    description: 'Delivery fee amount',
    example: 10,
  })
  deliveryFee: number;

  @ApiProperty({
    description: 'Total amount (subtotal + fees)',
    example: 115.5,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Transaction status',
    example: TransactionStatus.APPROVED,
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ApiPropertyOptional({
    description: 'External API transaction ID',
    example: 'txn_api_123456',
  })
  apiTransactionId?: string | null;

  @ApiPropertyOptional({
    description: 'External API reference',
    example: 'ref_api_123456',
  })
  apiReference?: string | null;

  @ApiPropertyOptional({
    description: 'Card type used for payment',
    example: CardType.VISA,
    enum: CardType,
  })
  cardType?: CardType | null;

  @ApiPropertyOptional({
    description: 'Last four digits of the card',
    example: '1234',
  })
  cardLastFourDigits?: string | null;

  @ApiPropertyOptional({
    description: 'Date when the transaction was processed',
    example: '2025-06-17T12:30:00Z',
  })
  processedAt?: Date | null;

  @ApiProperty({
    description: 'Transaction creation date',
    example: '2025-06-17T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Transaction last update date',
    example: '2025-06-17T12:00:00Z',
  })
  updatedAt: Date;
}
