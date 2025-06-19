import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TransactionStatus } from '../src/shared/domain/enums/transaction-status.enum';
import { CardType } from '../src/shared/domain/enums/card-type.enum';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('TransactionsController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  // Test customer IDs that already exist in the database
  const EXISTING_CUSTOMER_IDS = [
    '123b5671-9c0a-4464-9601-bf07d850644b',
    '0ff5eb05-3d0d-484f-83fe-8b1e08a146b6',
    '143ca694-6c90-42f7-8f72-6882ccfa0ae3',
    '1dc06112-2c9d-4aa1-89b1-07d580a44d6d',
    '208ad0ba-d0cd-4b50-b1f0-8c7e5215cdc2',
  ];

  // Test delivery address ID that already exists
  const EXISTING_DELIVERY_ADDRESS_ID = '97f35dcf-5fb6-4cd7-90ca-b211a9b69fdc';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Enable validation pipes like in the real application
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Clean transactions and transaction_items tables before each test
    //await dataSource.query('DELETE FROM transaction_items');
    await dataSource.query('DELETE FROM transactions');
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should create a new transaction successfully', async () => {
      const createTransactionDto = {
        customerId: EXISTING_CUSTOMER_IDS[0],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 100.5,
        baseFee: 5.0,
        deliveryFee: 10.0,
        totalAmount: 115.5,
        status: TransactionStatus.PENDING,
        apiTransactionId: 'api_txn_789',
        apiReference: 'api_ref_789',
        cardType: CardType.VISA,
        cardLastFourDigits: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(201);

      // Validate response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('transactionNumber');
      expect(response.body.customerId).toBe(createTransactionDto.customerId);
      expect(response.body.deliveryAddressId).toBe(
        createTransactionDto.deliveryAddressId,
      );
      expect(response.body.subtotal).toBe(createTransactionDto.subtotal);
      expect(response.body.baseFee).toBe(createTransactionDto.baseFee);
      expect(response.body.deliveryFee).toBe(createTransactionDto.deliveryFee);
      expect(response.body.totalAmount).toBe(createTransactionDto.totalAmount);
      expect(response.body.status).toBe(createTransactionDto.status);
      expect(response.body.apiTransactionId).toBe(
        createTransactionDto.apiTransactionId,
      );
      expect(response.body.apiReference).toBe(
        createTransactionDto.apiReference,
      );
      expect(response.body.cardType).toBe(createTransactionDto.cardType);
      expect(response.body.cardLastFourDigits).toBe(
        createTransactionDto.cardLastFourDigits,
      );
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a transaction with minimal required fields', async () => {
      const createTransactionDto = {
        customerId: EXISTING_CUSTOMER_IDS[1],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 50.0,
        baseFee: 2.5,
        deliveryFee: 5.0,
        totalAmount: 57.5,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(201);

      // Validate response structure with minimal fields
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('transactionNumber');
      expect(response.body.customerId).toBe(createTransactionDto.customerId);
      expect(response.body.deliveryAddressId).toBe(
        createTransactionDto.deliveryAddressId,
      );
      expect(response.body.subtotal).toBe(createTransactionDto.subtotal);
      expect(response.body.baseFee).toBe(createTransactionDto.baseFee);
      expect(response.body.deliveryFee).toBe(createTransactionDto.deliveryFee);
      expect(response.body.totalAmount).toBe(createTransactionDto.totalAmount);
      expect(response.body.status).toBe(TransactionStatus.PENDING); // Default status
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteDto = {
        customerId: EXISTING_CUSTOMER_IDS[2],
        // Missing required fields
        subtotal: 100.5,
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(incompleteDto)
        .expect(400);
    });

    it('should return 400 when field types are invalid', async () => {
      const invalidDto = {
        customerId: EXISTING_CUSTOMER_IDS[3],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 'invalid_number', // Should be number
        baseFee: 5.0,
        deliveryFee: 10.0,
        totalAmount: 115.5,
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when negative amounts are provided', async () => {
      const invalidDto = {
        customerId: EXISTING_CUSTOMER_IDS[4],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: -100.5, // Should be positive
        baseFee: 5.0,
        deliveryFee: 10.0,
        totalAmount: 115.5,
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when invalid status is provided', async () => {
      const invalidDto = {
        customerId: EXISTING_CUSTOMER_IDS[0],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 100.5,
        baseFee: 5.0,
        deliveryFee: 10.0,
        totalAmount: 115.5,
        status: 'INVALID_STATUS', // Should be valid enum value
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when invalid card type is provided', async () => {
      const invalidDto = {
        customerId: EXISTING_CUSTOMER_IDS[1],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 100.5,
        baseFee: 5.0,
        deliveryFee: 10.0,
        totalAmount: 115.5,
        cardType: 'INVALID_CARD', // Should be valid enum value
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle card last four digits validation', async () => {
      const invalidDto = {
        customerId: EXISTING_CUSTOMER_IDS[2],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 100.5,
        baseFee: 5.0,
        deliveryFee: 10.0,
        totalAmount: 115.5,
        cardLastFourDigits: '123', // Should be exactly 4 digits
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle various transaction statuses correctly', async () => {
      const statuses = [
        TransactionStatus.PENDING,
        TransactionStatus.APPROVED,
        TransactionStatus.DECLINED,
        TransactionStatus.CANCELLED,
        TransactionStatus.ERROR,
      ];

      for (let i = 0; i < statuses.length; i++) {
        const createTransactionDto = {
          customerId: EXISTING_CUSTOMER_IDS[i % EXISTING_CUSTOMER_IDS.length],
          deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
          subtotal: 100.0 + i,
          baseFee: 5.0,
          deliveryFee: 10.0,
          totalAmount: 115.0 + i,
          status: statuses[i],
        };

        const response = await request(app.getHttpServer())
          .post('/transactions')
          .send(createTransactionDto)
          .expect(201);

        expect(response.body.status).toBe(statuses[i]);
      }
    });

    it('should create transaction with all card types', async () => {
      const cardTypes = [
        CardType.VISA,
        CardType.MASTERCARD,
        CardType.AMEX,
        CardType.OTHER,
      ];

      for (let i = 0; i < cardTypes.length; i++) {
        const createTransactionDto = {
          customerId: EXISTING_CUSTOMER_IDS[i % EXISTING_CUSTOMER_IDS.length],
          deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
          subtotal: 50.0 + i * 10,
          baseFee: 3.0,
          deliveryFee: 7.0,
          totalAmount: 60.0 + i * 10,
          cardType: cardTypes[i],
          cardLastFourDigits: `000${i}`,
        };

        const response = await request(app.getHttpServer())
          .post('/transactions')
          .send(createTransactionDto)
          .expect(201);

        expect(response.body.cardType).toBe(cardTypes[i]);
        expect(response.body.cardLastFourDigits).toBe(`000${i}`);
      }
    });

    it('should generate unique transaction numbers', async () => {
      const transactions: any[] = [];

      // Create multiple transactions
      for (let i = 0; i < 3; i++) {
        const createTransactionDto = {
          customerId: EXISTING_CUSTOMER_IDS[i % EXISTING_CUSTOMER_IDS.length],
          deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
          subtotal: 100,
          baseFee: 5,
          deliveryFee: 10,
          totalAmount: 115,
        };

        const response = await request(app.getHttpServer())
          .post('/transactions')
          .send(createTransactionDto)
          .expect(201);

        transactions.push(response.body);
      }

      // Check that all transaction numbers are unique
      const transactionNumbers = transactions.map(
        (t: { transactionNumber: string }) => t.transactionNumber,
      );
      const uniqueNumbers = new Set(transactionNumbers);
      expect(uniqueNumbers.size).toBe(3);
    });

    it('should handle large monetary amounts correctly', async () => {
      const createTransactionDto = {
        customerId: EXISTING_CUSTOMER_IDS[0],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 9999.99,
        baseFee: 999.99,
        deliveryFee: 500,
        totalAmount: 11499.98,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(201);

      expect(response.body.subtotal).toBe(9999.99);
      expect(response.body.baseFee).toBe(999.99);
      expect(response.body.deliveryFee).toBe(500);
      expect(response.body.totalAmount).toBe(11499.98);
    });

    it('should handle zero fees correctly', async () => {
      const createTransactionDto = {
        customerId: EXISTING_CUSTOMER_IDS[1],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 100,
        baseFee: 0,
        deliveryFee: 0,
        totalAmount: 100,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(201);

      expect(response.body.subtotal).toBe(100);
      expect(response.body.baseFee).toBe(0);
      expect(response.body.deliveryFee).toBe(0);
      expect(response.body.totalAmount).toBe(100);
    });
  });

  describe('GET /transactions', () => {
    it('should return empty array when no transactions exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return transactions with limit and offset', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?limit=10&offset=0')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /transactions - additional tests', () => {
    it('should return all transactions using GET /transactions endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Integration test: Create and retrieve transaction', () => {
    it('should create a transaction and then retrieve it', async () => {
      // First, create a transaction
      const createTransactionDto = {
        customerId: EXISTING_CUSTOMER_IDS[3],
        deliveryAddressId: EXISTING_DELIVERY_ADDRESS_ID,
        subtotal: 75.0,
        baseFee: 3.75,
        deliveryFee: 7.5,
        totalAmount: 86.25,
        status: TransactionStatus.APPROVED,
        cardType: CardType.MASTERCARD,
        cardLastFourDigits: '5678',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(201);

      const createdTransaction = createResponse.body;
      expect(createdTransaction.id).toBeDefined();

      // Then, retrieve all transactions and verify the created one exists
      const getAllResponse = await request(app.getHttpServer())
        .get('/transactions')
        .expect(200);

      const transactions = getAllResponse.body;
      const foundTransaction = transactions.find(
        (tx: any) => tx.id === createdTransaction.id,
      );

      expect(foundTransaction).toBeDefined();
      expect(foundTransaction.customerId).toBe(createTransactionDto.customerId);
      expect(foundTransaction.status).toBe(createTransactionDto.status);
      expect(foundTransaction.cardType).toBe(createTransactionDto.cardType);
    });
  });
});
