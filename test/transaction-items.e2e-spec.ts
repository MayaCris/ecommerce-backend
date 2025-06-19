import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('TransactionItemsController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  // Using the provided transaction ID
  const EXISTING_TRANSACTION_ID = [
    '6c5d07dc-e669-478c-9ef2-46868dfc4181',
    '9a5129c1-7477-4f76-a4b6-133e2db1d38b',
    '9b9c464a-b1d1-467c-a7aa-f82f8a92676f',
    'bfd9b6e5-e3aa-499c-880b-dd943aac69d5',
  ];

  // Mock product IDs - these should exist in the system or be created
  const MOCK_PRODUCT_IDS = [
    '1a8b0459-c102-49a1-8dd1-5fecfdeb3ab8',
    '1c1278fe-6f50-4dbd-9e99-0949f56f9ee8',
    '5a6b850f-fb43-4d98-a2b7-115c7ddb4e1d',
  ];

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

    // Clean transaction_items table before each test
    await dataSource.query('DELETE FROM transaction_items');

    // Ensure we have some products in the database for testing
    try {
      await dataSource.query(
        `
        INSERT INTO products (id, name, description, price, stock_quantity, sku, image_url, is_active)
        VALUES 
          ($1, 'Test Product 1', 'Description for test product 1', 25.99, 100, 'TEST001', 'http://example.com/image1.jpg', true),
          ($2, 'Test Product 2', 'Description for test product 2', 15.50, 50, 'TEST002', 'http://example.com/image2.jpg', true),
          ($3, 'Test Product 3', 'Description for test product 3', 99.99, 25, 'TEST003', 'http://example.com/image3.jpg', true)
        ON CONFLICT (id) DO NOTHING
      `,
        MOCK_PRODUCT_IDS,
      );
    } catch {
      // Products might already exist, that's fine
    }

    // Ensure we have the required transaction in the database for testing
    try {
      await dataSource.query(
        `
        INSERT INTO transactions (id, transaction_number, customer_id, delivery_address_id, subtotal, base_fee, delivery_fee, total_amount, status)
        VALUES ($1, 'TXN_TEST_001', '123b5671-9c0a-4464-9601-bf07d850644b', '123b5671-9c0a-4464-9601-bf07d850644b', 100.00, 5.00, 10.00, 115.00, 'PENDING')
        ON CONFLICT (id) DO NOTHING
      `,
        [EXISTING_TRANSACTION_ID[0]],
      );
    } catch {
      // Transaction might already exist, that's fine
    }
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /transaction-items', () => {
    it('should create a new transaction item successfully', async () => {
      const createTransactionItemDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 2,
        unitPrice: 25.99,
        totalPrice: 51.98,
      };

      const response = await request(app.getHttpServer())
        .post('/transaction-items')
        .send(createTransactionItemDto)
        .expect(201);

      // Validate response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body.transactionId).toBe(
        createTransactionItemDto.transactionId,
      );
      expect(response.body.productId).toBe(createTransactionItemDto.productId);
      expect(response.body.quantity).toBe(createTransactionItemDto.quantity);
      expect(response.body.unitPrice).toBe(createTransactionItemDto.unitPrice);
      expect(response.body.totalPrice).toBe(
        createTransactionItemDto.totalPrice,
      );
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create multiple transaction items for the same transaction', async () => {
      const transactionItems = [
        {
          transactionId: EXISTING_TRANSACTION_ID[0],
          productId: MOCK_PRODUCT_IDS[0],
          quantity: 1,
          unitPrice: 25.99,
          totalPrice: 25.99,
        },
        {
          transactionId: EXISTING_TRANSACTION_ID[0],
          productId: MOCK_PRODUCT_IDS[1],
          quantity: 3,
          unitPrice: 15.5,
          totalPrice: 46.5,
        },
      ];

      const responses: any[] = [];
      for (const item of transactionItems) {
        const response = await request(app.getHttpServer())
          .post('/transaction-items')
          .send(item)
          .expect(201);
        responses.push(response.body);
      }

      // Validate that both items were created successfully
      expect(responses).toHaveLength(2);
      expect(responses[0].productId).toBe(MOCK_PRODUCT_IDS[0]);
      expect(responses[1].productId).toBe(MOCK_PRODUCT_IDS[1]);
      expect(responses[0].transactionId).toBe(EXISTING_TRANSACTION_ID[0]);
      expect(responses[1].transactionId).toBe(EXISTING_TRANSACTION_ID[0]);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        // Missing quantity, unitPrice, and totalPrice
      };

      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(incompleteDto)
        .expect(400);
    });

    it('should return 400 when field types are invalid', async () => {
      const invalidDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 'invalid-quantity', // Should be a number
        unitPrice: 25.99,
        totalPrice: 51.98,
      };

      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when quantity is zero or negative', async () => {
      const invalidDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 0, // Should be greater than 0
        unitPrice: 25.99,
        totalPrice: 0,
      };

      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when prices are negative', async () => {
      const invalidDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 2,
        unitPrice: -25.99, // Should be >= 0
        totalPrice: -51.98,
      };

      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when total price does not match calculation', async () => {
      const invalidDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 2,
        unitPrice: 25.99,
        totalPrice: 100.0, // Should be 51.98 (2 * 25.99)
      };

      // This should fail because the business logic validates total price calculation
      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when transaction ID is invalid UUID format', async () => {
      const invalidDto = {
        transactionId: 'invalid-uuid-format',
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 2,
        unitPrice: 25.99,
        totalPrice: 51.98,
      };

      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when product ID is invalid UUID format', async () => {
      const invalidDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: 'invalid-uuid-format',
        quantity: 2,
        unitPrice: 25.99,
        totalPrice: 51.98,
      };

      await request(app.getHttpServer())
        .post('/transaction-items')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle decimal precision correctly', async () => {
      const createTransactionItemDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 3,
        unitPrice: 10.33,
        totalPrice: 30.99, // 3 * 10.33 = 30.99
      };

      const response = await request(app.getHttpServer())
        .post('/transaction-items')
        .send(createTransactionItemDto)
        .expect(201);

      expect(response.body.unitPrice).toBe(10.33);
      expect(response.body.totalPrice).toBe(30.99);
      expect(response.body.quantity).toBe(3);
    });

    it('should create transaction item with minimum valid values', async () => {
      const createTransactionItemDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 1,
        unitPrice: 0.01,
        totalPrice: 0.01,
      };

      const response = await request(app.getHttpServer())
        .post('/transaction-items')
        .send(createTransactionItemDto)
        .expect(201);

      expect(response.body.quantity).toBe(1);
      expect(response.body.unitPrice).toBe(0.01);
      expect(response.body.totalPrice).toBe(0.01);
    });

    it('should create transaction item with large quantities and prices', async () => {
      const createTransactionItemDto = {
        transactionId: EXISTING_TRANSACTION_ID[0],
        productId: MOCK_PRODUCT_IDS[0],
        quantity: 999,
        unitPrice: 9999.99,
        totalPrice: 9989990.01, // 999 * 9999.99
      };

      const response = await request(app.getHttpServer())
        .post('/transaction-items')
        .send(createTransactionItemDto)
        .expect(201);

      expect(response.body.quantity).toBe(999);
      expect(response.body.unitPrice).toBe(9999.99);
      expect(response.body.totalPrice).toBe(9989990.01);
    });
  });
});
