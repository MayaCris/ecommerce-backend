export const PAYMENT_TOKENS = {
  // Repositories
  PAYMENT_REPOSITORY: Symbol('PaymentRepository'),

  // Services
  EXTERNAL_API_SERVICE: Symbol('ExternalApiService'),

  // Use Cases
  PROCESS_PAYMENT_USE_CASE: Symbol('ProcessPaymentUseCase'),
  CREATE_CARD_TOKEN_USE_CASE: Symbol('CreateCardTokenUseCase'),
  GET_PAYMENT_STATUS_USE_CASE: Symbol('GetPaymentStatusUseCase'),

  // Configuration
  EXTERNAL_API_CONFIG: Symbol('ExternalApiConfig'),
} as const;

export type PaymentTokens = typeof PAYMENT_TOKENS;
