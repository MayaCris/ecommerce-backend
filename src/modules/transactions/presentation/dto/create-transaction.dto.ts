import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { TransactionStatus } from '../../../../shared/domain/enums/transaction-status.enum';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

/**
 * DTO for creating a new transaction
 */
export class CreateTransactionDto {
  @ApiProperty({
    description: 'Customer ID',
    example: 'cust_123456',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Delivery address ID',
    example: 'addr_123456',
  })
  @IsString()
  deliveryAddressId: string;

  @ApiProperty({
    description: 'Subtotal amount (before fees)',
    example: 100.5,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  subtotal: number;

  @ApiProperty({
    description: 'Base fee amount',
    example: 5.0,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseFee: number;

  @ApiProperty({
    description: 'Delivery fee amount',
    example: 10.0,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deliveryFee: number;

  @ApiProperty({
    description: 'Total amount (subtotal + baseFee + deliveryFee)',
    example: 115.5,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  totalAmount: number;

  @ApiPropertyOptional({
    description: 'Transaction status',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'External API transaction ID',
    example: 'txn_api_123456',
  })
  @IsOptional()
  @IsString()
  apiTransactionId?: string;

  @ApiPropertyOptional({
    description: 'External API reference',
    example: 'ref_api_123456',
  })
  @IsOptional()
  @IsString()
  apiReference?: string;

  @ApiPropertyOptional({
    description: 'Card type used for payment',
    enum: CardType,
    example: CardType.VISA,
  })
  @IsOptional()
  @IsEnum(CardType)
  cardType?: CardType;

  @ApiPropertyOptional({
    description: 'Last four digits of the card',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsOptional()
  @IsString()
  @Length(4, 4, {
    message: 'Card last four digits must be exactly 4 characters long',
  })
  cardLastFourDigits?: string;
}
