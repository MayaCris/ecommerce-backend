import { CreditCard } from '../entities/credit-card.entity';

export interface externalApiPaymentRequest {
  amountInCents: number;
  currency: string;
  reference: string;
  customerEmail: string;
  acceptanceToken: string;
  paymentMethod: {
    type: string;
    token?: string;
    installments?: number;
  };
}

export interface externalApiPaymentResponse {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  created_at: string;
  finalized_at?: string;
  payment_method: {
    type: string;
    extra?: any;
  };
  status_message?: string;
  shipping_address?: any;
  redirect_url?: string;
  payment_link_id?: string;
  customer_email: string;
}

export interface externalApiTokenRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface externalApiTokenResponse {
  id: string;
  status: string;
  brand: string;
  name: string;
  last_four: string;
  bin: string;
  exp_year: string;
  exp_month: string;
  card_holder: string;
  created_at: string;
}

export interface externalApiService {
  createCardToken(creditCard: CreditCard): Promise<externalApiTokenResponse>;
  createPayment(
    request: externalApiPaymentRequest,
  ): Promise<externalApiPaymentResponse>;
  getPayment(transactionId: string): Promise<externalApiPaymentResponse>;
  getAcceptanceToken(): Promise<string>;
  validateSignature(
    signature: string,
    timestamp: string,
    requestBody: string,
  ): boolean;
}
