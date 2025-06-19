import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { CreditCard } from '../../domain/entities/credit-card.entity';
import {
  externalApiService,
  externalApiPaymentRequest,
  externalApiPaymentResponse,
  externalApiTokenRequest,
  externalApiTokenResponse,
} from '../../domain/services/external-api.service';
import { getApiExternaConfig } from '../../../../shared/infrastructure/config/api-externa.config';

@Injectable()
export class externalApiAdapter implements externalApiService {
  private readonly config;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.config = getApiExternaConfig(this.configService);
  }

  async createCardToken(
    creditCard: CreditCard,
  ): Promise<externalApiTokenResponse> {
    try {
      const tokenRequest: externalApiTokenRequest =
        creditCard.toExternalApiTokenRequest();

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/tokens/cards`,
          tokenRequest,
          {
            headers: {
              Authorization: `Bearer ${this.config.publicKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to create card token: ${
          error.response?.data?.error?.reason || error.message
        }`,
      );
    }
  }

  async createPayment(
    request: externalApiPaymentRequest,
  ): Promise<externalApiPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.config.baseUrl}/transactions`, request, {
          headers: {
            Authorization: `Bearer ${this.config.privateKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to create payment: ${
          error.response?.data?.error?.reason || error.message
        }`,
      );
    }
  }

  async getPayment(transactionId: string): Promise<externalApiPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.config.baseUrl}/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.privateKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to get payment: ${
          error.response?.data?.error?.reason || error.message
        }`,
      );
    }
  }

  async getAcceptanceToken(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.config.baseUrl}/merchants/${this.config.publicKey}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.publicKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error) {
      throw new Error(
        `Failed to get acceptance token: ${
          error.response?.data?.error?.reason || error.message
        }`,
      );
    }
  }

  validateSignature(
    signature: string,
    timestamp: string,
    requestBody: string,
  ): boolean {
    try {
      // Construct the string to sign according to API documentation
      const stringToSign = `${timestamp}.${requestBody}`;

      // Create HMAC SHA256 hash
      const expectedSignature = crypto
        .createHmac('sha256', this.config.eventsKey)
        .update(stringToSign)
        .digest('hex');

      // Compare signatures using secure comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper method to verify integrity signature for sensitive operations
   */
  verifyIntegritySignature(data: any): string {
    const sortedKeys = Object.keys(data).sort();
    const concatenatedString = sortedKeys
      .map((key) => `${key}${data[key]}`)
      .join('');

    return crypto
      .createHash('sha256')
      .update(concatenatedString + this.config.integrityKey)
      .digest('hex');
  }
}
