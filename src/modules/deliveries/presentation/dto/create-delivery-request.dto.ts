import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';

export class CreateDeliveryRequestDto {
  @ApiProperty({
    description: 'Transaction ID associated with this delivery',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Transaction ID must be a valid UUID' })
  transactionId: string;

  @ApiProperty({
    description: 'Delivery address ID where the package will be delivered',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'Delivery address ID must be a valid UUID' })
  deliveryAddressId: string;

  @ApiProperty({
    description: 'Tracking number for the package',
    required: false,
    example: 'TRK123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Tracking number cannot exceed 100 characters' })
  trackingNumber?: string;

  @ApiProperty({
    description: 'Carrier company handling the delivery',
    required: false,
    example: 'DHL Express',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Carrier name cannot exceed 100 characters' })
  carrier?: string;

  @ApiProperty({
    description: 'Current status of the delivery',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus, { message: 'Status must be a valid delivery status' })
  status?: DeliveryStatus;

  @ApiProperty({
    description: 'Estimated delivery date',
    required: false,
    example: '2024-12-25',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Estimated delivery date must be a valid date' })
  estimatedDeliveryDate?: string;

  @ApiProperty({
    description: 'Additional notes for the delivery',
    required: false,
    example: 'Leave package at front door if no one is home',
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
