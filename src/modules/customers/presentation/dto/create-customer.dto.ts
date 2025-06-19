import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new customer
 */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @Transform(({ value }: { value: string }) => value?.trim() || value)
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
    minLength: 10,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;
}
