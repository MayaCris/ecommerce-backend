import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { PaymentMethod } from '../../../../shared/domain/enums/payment-method.enum';

export class ProcessPaymentRequestDto {
  @ApiProperty({
    description: 'Payment amount in local currency',
    example: 100.5,
    minimum: 1,
    maximum: 1000000,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1, { message: 'Amount must be at least 1' })
  @Max(1000000, { message: 'Amount cannot exceed 1,000,000' })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP',
    default: 'COP',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Unique payment reference',
    example: 'PAY-2024-001234',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({
    description: 'Customer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Customer ID must be a valid UUID' })
  customerId: string;

  @ApiProperty({
    description: 'Transaction UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Transaction ID must be a valid UUID' })
  transactionId: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  customerEmail: string;

  @ApiProperty({
    description: 'Payment method type',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Card token (required for card payments)',
    example: 'tok_test_12345_67890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardToken?: string;

  @ApiProperty({
    description: 'Number of installments (for card payments)',
    example: 1,
    minimum: 1,
    maximum: 36,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Installments must be at least 1' })
  @Max(36, { message: 'Installments cannot exceed 36' })
  installments?: number;
}

export class ProcessPaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Payment reference',
    example: 'PAY-2024-001234',
  })
  reference: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP',
  })
  currency: string;

  @ApiProperty({
    description: 'External API transaction ID',
    example: 'ext_12345_abcdef',
    required: false,
  })
  externalTransactionId?: string;

  @ApiProperty({
    description: 'External API reference',
    example: 'ext_ref_12345',
    required: false,
  })
  externalReference?: string;

  @ApiProperty({
    description: 'Status message from payment processor',
    example: 'Transaction approved',
    required: false,
  })
  statusMessage?: string;

  @ApiProperty({
    description: 'Redirect URL for completing payment',
    example: 'https://api.example.com/payments/redirect/12345',
    required: false,
  })
  redirectUrl?: string;

  @ApiProperty({
    description: 'Payment creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}
