import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PriceDto {
  @ApiProperty({ example: 999.99, description: 'Product price amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD', description: 'Price currency' })
  @IsString()
  currency: string;
}

class StockDto {
  @ApiProperty({ example: 10, description: 'Stock quantity' })
  @IsNumber()
  value: number;
}

class SkuDto {
  @ApiProperty({ example: 'LAPTOP-TEST-001', description: 'Product SKU' })
  @IsString()
  value: string;
}

export class CreateProductRequestDto {
  @ApiProperty({ example: 'Test Laptop', description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'A high-performance laptop',
    description: 'Product description',
  })
  @IsString()
  description: string;

  @ApiProperty({ type: PriceDto, description: 'Product price' })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty({ type: StockDto, description: 'Stock quantity' })
  @ValidateNested()
  @Type(() => StockDto)
  stock: StockDto;

  @ApiProperty({ type: SkuDto, description: 'Product SKU' })
  @ValidateNested()
  @Type(() => SkuDto)
  sku: SkuDto;

  @ApiProperty({
    example: 'https://example.com/laptop.jpg',
    description: 'Product image URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: true, description: 'Whether the product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
