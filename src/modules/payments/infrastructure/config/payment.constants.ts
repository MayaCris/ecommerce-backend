export const PAYMENT_CONSTANTS = {
  // API Endpoints
  CARD_TOKENS_ENDPOINT: '/tokens/cards',
  TRANSACTIONS_ENDPOINT: '/transactions',
  MERCHANTS_ENDPOINT: '/merchants',

  // HTTP Methods
  HTTP_TIMEOUT: 30000,
  MAX_REDIRECTS: 5,

  // Currency
  DEFAULT_CURRENCY: 'COP',
  CENTS_MULTIPLIER: 100,

  // Validation
  MIN_AMOUNT_CENTS: 100, // $1.00 COP
  MAX_AMOUNT_CENTS: 100000000, // $1,000,000 COP

  // Status Mapping
  EXTERNAL_STATUS: {
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    PENDING: 'PENDING',
    VOIDED: 'VOIDED',
    ERROR: 'ERROR',
  },

  // Headers
  CONTENT_TYPE: 'application/json',
  AUTHORIZATION_PREFIX: 'Bearer ',

  // Webhook
  SIGNATURE_ALGORITHM: 'sha256',
  TIMESTAMP_TOLERANCE: 300, // 5 minutes in seconds
} as const;
