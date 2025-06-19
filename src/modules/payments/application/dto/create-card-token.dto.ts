export interface CreateCardTokenDto {
  number: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolder: string;
}

export interface CreateCardTokenResponseDto {
  token: string;
  brand: string;
  name: string;
  lastFour: string;
  bin: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolder: string;
}
