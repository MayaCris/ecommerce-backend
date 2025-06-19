import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDeliveryAddressDto {
  @ApiProperty({
    description: 'Customer ID who owns this address',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: 'Street address',
    example: 'Carrera 15 #123-45',
    maxLength: 255,
  })
  @IsString()
  @MinLength(5, {
    message: 'Street address must be at least 5 characters long',
  })
  @MaxLength(255, { message: 'Street address must not exceed 255 characters' })
  streetAddress: string;

  @ApiProperty({
    description: 'City name',
    example: 'Bogotá',
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city: string;

  @ApiProperty({
    description: 'State or department',
    example: 'Cundinamarca',
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'State must be at least 2 characters long' })
  @MaxLength(100, { message: 'State must not exceed 100 characters' })
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '110111',
    maxLength: 20,
  })
  @IsString()
  @MinLength(2, { message: 'Postal code must be at least 2 characters long' })
  @MaxLength(20, { message: 'Postal code must not exceed 20 characters' })
  postalCode: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Colombia',
    maxLength: 100,
    default: 'Colombia',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string;

  @ApiProperty({
    description: 'Additional information or delivery instructions',
    example: 'Apartment 501, ring the doorbell twice',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ApiProperty({
    description: 'Whether this is the default address for the customer',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
