import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetPaymentStatusRequestDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Payment ID must be a valid UUID' })
  paymentId: string;
}

export class GetPaymentStatusResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'APPROVED',
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
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  customerId: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  transactionId: string;

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
    description: 'Processing date',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  processingDate?: Date;

  @ApiProperty({
    description: 'Payment creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Payment last update timestamp',
    example: '2024-01-15T10:35:00Z',
  })
  updatedAt: Date;
}
