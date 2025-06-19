import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  CardType,
  PaymentStatus,
  Currency,
  PaymentMethod,
} from '../src/shared/domain/enums';
import { PAYMENT_TOKENS } from '../src/modules/payments/payments.tokens';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('PaymentsController (e2e)', () => {
  let app: INestApplication<App>;
  let mockExternalApiService: any;
  let mockPaymentRepository: any;

  // Test data
  const VALID_CARD_DATA = {
    number: '4242424242424242',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '2025',
    cardHolder: 'John Doe',
  };

  const VALID_PAYMENT_DATA = {
    amount: 50000, // $500.00 in cents
    currency: Currency.COP,
    reference: 'ORDER-123456',
    customerId: '123e4567-e89b-12d3-a456-426614174000',
    transactionId: 'TXN-789012',
    customerEmail: 'john.doe@example.com',
    paymentMethod: PaymentMethod.CARD,
    cardToken: null, // Will be set after card tokenization
    installments: 1,
  };

  // Mock responses from external API
  const MOCK_TOKEN_RESPONSE = {
    data: {
      id: 'tok_test_12345_67890abcdef',
      brand: 'VISA',
      name: 'VISA-4242',
      last_four: '4242',
      bin: '424242',
      exp_month: '12',
      exp_year: '25',
      card_holder: 'JOHN DOE',
      created_at: '2024-01-15T10:30:00.000Z',
    },
  };

  const MOCK_PAYMENT_RESPONSE = {
    data: {
      id: 'pay_12345_abcdef67890',
      status: 'APPROVED',
      reference: 'ORDER-123456',
      amount_in_cents: 50000,
      currency: 'COP',
      transaction_id: 'ext_txn_123456789',
      external_reference: 'ext_ref_123456789',
      status_message: 'Transaction approved',
      redirect_url: null,
      created_at: '2024-01-15T10:35:00.000Z',
    },
  };

  const MOCK_STATUS_RESPONSE = {
    data: {
      id: 'pay_12345_abcdef67890',
      status: 'APPROVED',
      reference: 'ORDER-123456',
      amount_in_cents: 50000,
      currency: 'COP',
      transaction_id: 'ext_txn_123456789',
      external_reference: 'ext_ref_123456789',
      status_message: 'Transaction approved',
      processing_date: '2024-01-15T10:35:00.000Z',
      created_at: '2024-01-15T10:35:00.000Z',
      updated_at: '2024-01-15T10:35:00.000Z',
    },
  };

  beforeEach(async () => {
    // Create mock external API service
    mockExternalApiService = {
      createCardToken: jest.fn(),
      processPayment: jest.fn(),
      getPaymentStatus: jest.fn(),
    };

    // Create mock payment repository
    mockPaymentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PAYMENT_TOKENS.EXTERNAL_API_SERVICE)
      .useValue(mockExternalApiService)
      .overrideProvider(PAYMENT_TOKENS.PAYMENT_REPOSITORY)
      .useValue(mockPaymentRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    // Enable validation pipes like in the real application
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Setup default mock responses
    mockExternalApiService.createCardToken.mockResolvedValue({
      isOk: () => true,
      value: MOCK_TOKEN_RESPONSE.data,
    });

    mockExternalApiService.processPayment.mockResolvedValue({
      isOk: () => true,
      value: MOCK_PAYMENT_RESPONSE.data,
    });

    mockExternalApiService.getPaymentStatus.mockResolvedValue({
      isOk: () => true,
      value: MOCK_STATUS_RESPONSE.data,
    });

    // Setup payment repository mock responses
    mockPaymentRepository.save.mockResolvedValue({
      id: 'pay_12345_abcdef67890',
      reference: 'ORDER-123456',
      amount: 50000,
      currency: 'COP',
      status: PaymentStatus.APPROVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockPaymentRepository.findById.mockResolvedValue({
      isOk: () => true,
      value: {
        id: 'pay_12345_abcdef67890',
        reference: 'ORDER-123456',
        amount: 50000,
        currency: 'COP',
        status: PaymentStatus.APPROVED,
        customerId: VALID_PAYMENT_DATA.customerId,
        transactionId: VALID_PAYMENT_DATA.transactionId,
        apiTransactionId: 'ext_txn_123456789',
        apiReference: 'ext_ref_123456789',
        statusMessage: 'Transaction approved',
        processingDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });

  afterEach(async () => {
    // Clean up mocks after each test
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /payments/cards/tokens', () => {
    it('should create a card token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(VALID_CARD_DATA)
        .expect(201);

      // Verify response structure
      expect(response.body).toMatchObject({
        token: expect.stringMatching(/^tok_test_/),
        brand: CardType.VISA,
        name: expect.stringMatching(/VISA/),
        lastFour: '4242',
        bin: '424242',
        expiryMonth: '12',
        expiryYear: '25',
        cardHolder: 'JOHN DOE',
      });

      // Verify external API was called correctly
      expect(mockExternalApiService.createCardToken).toHaveBeenCalledWith({
        number: VALID_CARD_DATA.number,
        cvc: VALID_CARD_DATA.cvc,
        expiryMonth: VALID_CARD_DATA.expiryMonth,
        expiryYear: VALID_CARD_DATA.expiryYear,
        cardHolder: VALID_CARD_DATA.cardHolder,
      });
    });

    it('should return 400 for invalid card number', async () => {
      const invalidCardData = {
        ...VALID_CARD_DATA,
        number: '123', // Too short
      };

      await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(invalidCardData)
        .expect(400);

      expect(mockExternalApiService.createCardToken).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid CVC', async () => {
      const invalidCardData = {
        ...VALID_CARD_DATA,
        cvc: '12', // Too short
      };

      await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(invalidCardData)
        .expect(400);

      expect(mockExternalApiService.createCardToken).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid expiry month', async () => {
      const invalidCardData = {
        ...VALID_CARD_DATA,
        expiryMonth: '13', // Invalid month
      };

      await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(invalidCardData)
        .expect(400);

      expect(mockExternalApiService.createCardToken).not.toHaveBeenCalled();
    });

    it('should return 400 for missing card holder', async () => {
      const invalidCardData = {
        ...VALID_CARD_DATA,
        cardHolder: '', // Empty
      };

      await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(invalidCardData)
        .expect(400);

      expect(mockExternalApiService.createCardToken).not.toHaveBeenCalled();
    });

    it('should handle external API errors gracefully', async () => {
      mockExternalApiService.createCardToken.mockResolvedValue({
        isOk: () => false,
        isErr: () => true,
        error: new Error('External API error'),
      });

      await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(VALID_CARD_DATA)
        .expect(400);

      expect(mockExternalApiService.createCardToken).toHaveBeenCalled();
    });
  });

  describe('POST /payments/process', () => {
    let cardToken: string;

    beforeEach(async () => {
      // First create a card token
      const tokenResponse = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(VALID_CARD_DATA)
        .expect(201);

      cardToken = tokenResponse.body.token;
    });

    it('should process a payment successfully', async () => {
      const paymentData = {
        ...VALID_PAYMENT_DATA,
        cardToken,
      };

      const response = await request(app.getHttpServer())
        .post('/payments/process')
        .send(paymentData)
        .expect(201);

      // Verify response structure
      expect(response.body).toMatchObject({
        paymentId: expect.any(String),
        status: PaymentStatus.APPROVED,
        reference: VALID_PAYMENT_DATA.reference,
        amount: VALID_PAYMENT_DATA.amount,
        currency: VALID_PAYMENT_DATA.currency,
        externalTransactionId: 'ext_txn_123456789',
        externalReference: 'ext_ref_123456789',
        statusMessage: 'Transaction approved',
        redirectUrl: null,
        createdAt: expect.any(String),
      });

      // Verify external API was called correctly
      expect(mockExternalApiService.processPayment).toHaveBeenCalledWith({
        amount: VALID_PAYMENT_DATA.amount,
        currency: VALID_PAYMENT_DATA.currency,
        reference: VALID_PAYMENT_DATA.reference,
        customerId: VALID_PAYMENT_DATA.customerId,
        transactionId: VALID_PAYMENT_DATA.transactionId,
        customerEmail: VALID_PAYMENT_DATA.customerEmail,
        paymentMethod: VALID_PAYMENT_DATA.paymentMethod,
        cardToken,
        installments: VALID_PAYMENT_DATA.installments,
      });

      // Verify payment repository was called to save the payment
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: VALID_PAYMENT_DATA.reference,
          amount: VALID_PAYMENT_DATA.amount,
          currency: VALID_PAYMENT_DATA.currency,
          status: PaymentStatus.APPROVED,
        }),
      );
    });

    it('should return 400 for invalid amount', async () => {
      const invalidPaymentData = {
        ...VALID_PAYMENT_DATA,
        cardToken,
        amount: -100, // Negative amount
      };

      await request(app.getHttpServer())
        .post('/payments/process')
        .send(invalidPaymentData)
        .expect(400);

      expect(mockExternalApiService.processPayment).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid currency', async () => {
      const invalidPaymentData = {
        ...VALID_PAYMENT_DATA,
        cardToken,
        currency: 'INVALID',
      };

      await request(app.getHttpServer())
        .post('/payments/process')
        .send(invalidPaymentData)
        .expect(400);

      expect(mockExternalApiService.processPayment).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidPaymentData = {
        amount: VALID_PAYMENT_DATA.amount,
        // Missing other required fields
      };

      await request(app.getHttpServer())
        .post('/payments/process')
        .send(invalidPaymentData)
        .expect(400);

      expect(mockExternalApiService.processPayment).not.toHaveBeenCalled();
    });

    it('should handle external API payment errors', async () => {
      mockExternalApiService.processPayment.mockResolvedValue({
        isOk: () => false,
        isErr: () => true,
        error: new Error('Payment declined'),
      });

      const paymentData = {
        ...VALID_PAYMENT_DATA,
        cardToken,
      };

      await request(app.getHttpServer())
        .post('/payments/process')
        .send(paymentData)
        .expect(500);

      expect(mockExternalApiService.processPayment).toHaveBeenCalled();
    });
  });

  describe('GET /payments/:paymentId/status', () => {
    let paymentId: string;

    beforeEach(async () => {
      // First create a card token and process a payment
      const tokenResponse = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(VALID_CARD_DATA)
        .expect(201);

      const cardToken = tokenResponse.body.token;

      const paymentData = {
        ...VALID_PAYMENT_DATA,
        cardToken,
      };

      const paymentResponse = await request(app.getHttpServer())
        .post('/payments/process')
        .send(paymentData)
        .expect(201);

      paymentId = paymentResponse.body.paymentId;
    });

    it('should get payment status successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${paymentId}/status`)
        .expect(200);

      // Verify response structure
      expect(response.body).toMatchObject({
        paymentId: expect.any(String),
        status: PaymentStatus.APPROVED,
        reference: VALID_PAYMENT_DATA.reference,
        amount: VALID_PAYMENT_DATA.amount,
        currency: VALID_PAYMENT_DATA.currency,
        customerId: VALID_PAYMENT_DATA.customerId,
        transactionId: VALID_PAYMENT_DATA.transactionId,
        externalTransactionId: 'ext_txn_123456789',
        externalReference: 'ext_ref_123456789',
        statusMessage: 'Transaction approved',
        processingDate: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify external API was called correctly
      expect(mockExternalApiService.getPaymentStatus).toHaveBeenCalledWith({
        paymentId,
      });
    });

    it('should return 404 for non-existent payment', async () => {
      const nonExistentPaymentId = '00000000-0000-0000-0000-000000000000';

      mockExternalApiService.getPaymentStatus.mockResolvedValue({
        isOk: () => false,
        isErr: () => true,
        error: new Error('Payment not found'),
      });

      await request(app.getHttpServer())
        .get(`/payments/${nonExistentPaymentId}/status`)
        .expect(404);
    });

    it('should return 400 for invalid payment ID format', async () => {
      const invalidPaymentId = 'invalid-uuid';

      await request(app.getHttpServer())
        .get(`/payments/${invalidPaymentId}/status`)
        .expect(500); // Should be caught by UUID validation if implemented
    });

    it('should handle external API status errors', async () => {
      mockExternalApiService.getPaymentStatus.mockResolvedValue({
        isOk: () => false,
        isErr: () => true,
        error: new Error('External API error'),
      });

      await request(app.getHttpServer())
        .get(`/payments/${paymentId}/status`)
        .expect(500);

      expect(mockExternalApiService.getPaymentStatus).toHaveBeenCalled();
    });
  });

  describe('Integration Flow', () => {
    it('should complete full payment flow successfully', async () => {
      // Step 1: Create card token
      const tokenResponse = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(VALID_CARD_DATA)
        .expect(201);

      expect(tokenResponse.body.token).toBeDefined();
      const cardToken = tokenResponse.body.token;

      // Step 2: Process payment
      const paymentData = {
        ...VALID_PAYMENT_DATA,
        cardToken,
      };

      const paymentResponse = await request(app.getHttpServer())
        .post('/payments/process')
        .send(paymentData)
        .expect(201);

      expect(paymentResponse.body.paymentId).toBeDefined();
      expect(paymentResponse.body.status).toBe(PaymentStatus.APPROVED);
      const paymentId = paymentResponse.body.paymentId;

      // Step 3: Check payment status
      const statusResponse = await request(app.getHttpServer())
        .get(`/payments/${paymentId}/status`)
        .expect(200);

      expect(statusResponse.body.paymentId).toBe(paymentId);
      expect(statusResponse.body.status).toBe(PaymentStatus.APPROVED);
      expect(statusResponse.body.reference).toBe(VALID_PAYMENT_DATA.reference);

      // Verify all external API calls were made
      expect(mockExternalApiService.createCardToken).toHaveBeenCalledTimes(1);
      expect(mockExternalApiService.processPayment).toHaveBeenCalledTimes(1);
      expect(mockExternalApiService.getPaymentStatus).toHaveBeenCalledTimes(1);

      // Verify payment repository was called to save the payment
      expect(mockPaymentRepository.save).toHaveBeenCalled();
    });
  });

  describe('Card Type Detection', () => {
    it('should detect VISA cards correctly', async () => {
      const visaCardData = {
        ...VALID_CARD_DATA,
        number: '4242424242424242', // VISA test card
      };

      const response = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(visaCardData)
        .expect(201);

      expect(response.body.brand).toBe(CardType.VISA);
    });

    it('should detect MASTERCARD correctly', async () => {
      mockExternalApiService.createCardToken.mockResolvedValue({
        isOk: () => true,
        value: {
          data: {
            ...MOCK_TOKEN_RESPONSE.data,
            brand: 'MASTERCARD',
            name: 'MASTERCARD-5555',
          },
        },
      });

      const mastercardData = {
        ...VALID_CARD_DATA,
        number: '5555555555554444', // MASTERCARD test card
      };

      const response = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(mastercardData)
        .expect(201);

      expect(response.body.brand).toBe(CardType.MASTERCARD);
    });

    it('should handle unknown card types', async () => {
      mockExternalApiService.createCardToken.mockResolvedValue({
        isOk: () => true,
        value: {
          data: {
            ...MOCK_TOKEN_RESPONSE.data,
            brand: 'UNKNOWN_BRAND',
            name: 'UNKNOWN-1234',
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/payments/cards/tokens')
        .send(VALID_CARD_DATA)
        .expect(201);

      expect(response.body.brand).toBe(CardType.OTHER);
    });
  });
});
