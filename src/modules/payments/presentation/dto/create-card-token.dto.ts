import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  Length,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

export class CreateCardTokenRequestDto {
  @ApiProperty({
    description: 'Credit card number (13-19 digits)',
    example: '4242424242424242',
    minLength: 13,
    maxLength: 19,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, {
    message: 'Card number must be 13-19 digits',
  })
  number: string;

  @ApiProperty({
    description: 'Card verification code (3-4 digits)',
    example: '123',
    minLength: 3,
    maxLength: 4,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, {
    message: 'CVC must be 3-4 digits',
  })
  cvc: string;

  @ApiProperty({
    description: 'Expiry month (1-12 or 01-12)',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0?[1-9]|1[0-2])$/, {
    message: 'Expiry month must be between 01 and 12',
  })
  expiryMonth: string;

  @ApiProperty({
    description: 'Expiry year (2 or 4 digits)',
    example: '2025',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\d{2}|\d{4})$/, {
    message: 'Expiry year must be 2 or 4 digits',
  })
  expiryYear: string;
  @ApiProperty({
    description: 'Card holder name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50, {
    message: 'Card holder name must be between 2 and 50 characters',
  })
  cardHolder: string;

  @ApiProperty({
    description: 'Card type (optional - can be auto-detected)',
    example: CardType.VISA,
    enum: CardType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CardType, {
    message: 'Card type must be a valid type',
  })
  cardType?: CardType;
}

export class CreateCardTokenResponseDto {
  @ApiProperty({
    description: 'Generated card token',
    example: 'tok_test_12345_67890abcdef',
  })
  token: string;
  @ApiProperty({
    description: 'Card brand/type',
    example: CardType.VISA,
    enum: CardType,
  })
  brand: CardType;

  @ApiProperty({
    description: 'Card type name (deprecated - use brand instead)',
    example: 'VISA',
    deprecated: true,
  })
  name: string;

  @ApiProperty({
    description: 'Last four digits of the card',
    example: '4242',
  })
  lastFour: string;

  @ApiProperty({
    description: 'Bank Identification Number',
    example: '424242',
  })
  bin: string;

  @ApiProperty({
    description: 'Expiry month',
    example: '12',
  })
  expiryMonth: string;

  @ApiProperty({
    description: 'Expiry year',
    example: '2025',
  })
  expiryYear: string;

  @ApiProperty({
    description: 'Card holder name',
    example: 'JOHN DOE',
  })
  cardHolder: string;
}
