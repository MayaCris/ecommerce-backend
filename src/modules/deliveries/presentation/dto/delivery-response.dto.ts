import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';

export class DeliveryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the delivery',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction ID associated with this delivery',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Delivery address ID where the package will be delivered',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  deliveryAddressId: string;

  @ApiProperty({
    description: 'Tracking number for the package',
    example: 'TRK123456789',
    nullable: true,
  })
  trackingNumber: string | null;

  @ApiProperty({
    description: 'Carrier company handling the delivery',
    example: 'DHL Express',
    nullable: true,
  })
  carrier: string | null;

  @ApiProperty({
    description: 'Current status of the delivery',
    enum: DeliveryStatus,
    example: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @ApiProperty({
    description: 'Estimated delivery date',
    example: '2024-12-25',
    nullable: true,
  })
  estimatedDeliveryDate: string | null;

  @ApiProperty({
    description: 'Date and time when the package was shipped',
    example: '2024-12-20T10:30:00Z',
    nullable: true,
  })
  shippedAt: string | null;

  @ApiProperty({
    description: 'Date and time when the package was delivered',
    example: '2024-12-25T14:15:00Z',
    nullable: true,
  })
  deliveredAt: string | null;

  @ApiProperty({
    description: 'Additional notes for the delivery',
    example: 'Leave package at front door if no one is home',
    nullable: true,
  })
  deliveryNotes: string | null;

  @ApiProperty({
    description: 'Date and time when the delivery record was created',
    example: '2024-12-18T08:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date and time when the delivery record was last updated',
    example: '2024-12-20T10:30:00Z',
  })
  updatedAt: string;
}
