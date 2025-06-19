import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { CreditCard } from '../../domain/entities/credit-card.entity';
import { externalApiService } from '../../domain/services/external-api.service';
import { PAYMENT_TOKENS } from '../../payments.tokens';
import {
  CreateCardTokenDto,
  CreateCardTokenResponseDto,
} from '../dto/create-card-token.dto';

@Injectable()
export class CreateCardTokenUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.EXTERNAL_API_SERVICE)
    private readonly externalApiService: externalApiService,
  ) {}

  async execute(
    dto: CreateCardTokenDto,
  ): Promise<Result<CreateCardTokenResponseDto, Error>> {
    try {
      // Create and validate credit card
      const creditCard = new CreditCard({
        number: dto.number,
        cvc: dto.cvc,
        expiryMonth: dto.expiryMonth,
        expiryYear: dto.expiryYear,
        cardHolder: dto.cardHolder,
      });

      // Check if card is expired
      if (creditCard.isExpired()) {
        return err(new Error('Credit card has expired'));
      }

      // Create token using external API service
      const tokenResponse =
        await this.externalApiService.createCardToken(creditCard);

      // Map response to DTO
      const response: CreateCardTokenResponseDto = {
        token: tokenResponse.id,
        brand: tokenResponse.brand,
        name: tokenResponse.name,
        lastFour: tokenResponse.last_four,
        bin: tokenResponse.bin,
        expiryMonth: tokenResponse.exp_month,
        expiryYear: tokenResponse.exp_year,
        cardHolder: tokenResponse.card_holder,
      };

      return ok(response);
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error('Failed to create card token'),
      );
    }
  }
}
