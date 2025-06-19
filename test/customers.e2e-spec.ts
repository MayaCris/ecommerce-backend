import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('CustomersController (e2e)', () => {
  let app: INestApplication<App>;

  // Helper function to generate unique emails
  const getUniqueEmail = (prefix: string): string => {
    return `${prefix}.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@example.com`;
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /customers', () => {
    it('should create a new customer successfully with all fields', async () => {
      const createCustomerDto = {
        email: getUniqueEmail('john.doe'),
        firstName: 'John',
        lastName: 'Doe',
        phone: '+573001234567',
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      // Validate response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createCustomerDto.email);
      expect(response.body.firstName).toBe(createCustomerDto.firstName);
      expect(response.body.lastName).toBe(createCustomerDto.lastName);
      expect(response.body.fullName).toBe('John Doe');
      expect(response.body.phone).toBeDefined();
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a customer with minimal required fields (no phone)', async () => {
      const createCustomerDto = {
        email: getUniqueEmail('jane.smith'),
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      // Validate response structure with minimal fields
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createCustomerDto.email);
      expect(response.body.firstName).toBe(createCustomerDto.firstName);
      expect(response.body.lastName).toBe(createCustomerDto.lastName);
      expect(response.body.fullName).toBe('Jane Smith');
      expect(response.body.phone).toBeUndefined();
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 409 when email already exists', async () => {
      const email = getUniqueEmail('duplicate');
      const createCustomerDto = {
        email,
        firstName: 'First',
        lastName: 'Customer',
      };

      // Create first customer
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      // Try to create second customer with same email
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({
          ...createCustomerDto,
          firstName: 'Second',
          lastName: 'Customer',
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteDto = {
        email: getUniqueEmail('incomplete'),
        // Missing firstName and lastName
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(incompleteDto)
        .expect(400);
    });

    it('should return 400 when email format is invalid', async () => {
      const invalidDto = {
        email: 'invalid-email-format',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when firstName is too long', async () => {
      const invalidDto = {
        email: 'toolong@example.com',
        firstName: 'A'.repeat(101), // Exceeds 100 character limit
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when lastName is too long', async () => {
      const invalidDto = {
        email: 'toolong2@example.com',
        firstName: 'John',
        lastName: 'B'.repeat(101), // Exceeds 100 character limit
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when phone number is invalid', async () => {
      const invalidDto = {
        email: 'validphone@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123', // Too short
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle Colombian phone numbers correctly', async () => {
      const createCustomerDto = {
        email: getUniqueEmail('colombian'),
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        phone: '3001234567', // Colombian mobile without country code
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      expect(response.body.phone).toContain('57'); // Should include Colombia country code
    });
  });

  describe('GET /customers', () => {
    it('should return empty array when no customers exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all customers after creating some', async () => {
      // Create multiple customers
      const customer1 = {
        email: getUniqueEmail('customer1'),
        firstName: 'Customer',
        lastName: 'One',
      };

      const customer2 = {
        email: getUniqueEmail('customer2'),
        firstName: 'Customer',
        lastName: 'Two',
        phone: '+573001234567',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(customer1)
        .expect(201);

      await request(app.getHttpServer())
        .post('/customers')
        .send(customer2)
        .expect(201);

      // Get all customers
      const response = await request(app.getHttpServer())
        .get('/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      const foundCustomer1 = response.body.find(
        (c: any) => c.email === customer1.email,
      );
      const foundCustomer2 = response.body.find(
        (c: any) => c.email === customer2.email,
      );

      expect(foundCustomer1).toBeDefined();
      expect(foundCustomer1.fullName).toBe('Customer One');
      expect(foundCustomer1.phone).toBeUndefined();

      expect(foundCustomer2).toBeDefined();
      expect(foundCustomer2.fullName).toBe('Customer Two');
      expect(foundCustomer2.phone).toBeDefined();
    });
  });

  describe('Integration test: Create and retrieve customer', () => {
    it('should create a customer and then retrieve it in the list', async () => {
      // First, create a customer
      const createCustomerDto = {
        email: getUniqueEmail('integration'),
        firstName: 'Integration',
        lastName: 'Test',
        phone: '+573009876543',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      const createdCustomer = createResponse.body;
      expect(createdCustomer.id).toBeDefined();

      // Then, retrieve all customers and verify the created one exists
      const getAllResponse = await request(app.getHttpServer())
        .get('/customers')
        .expect(200);

      const customers = getAllResponse.body;
      const foundCustomer = customers.find(
        (c: any) => c.id === createdCustomer.id,
      );

      expect(foundCustomer).toBeDefined();
      expect(foundCustomer.email).toBe(createCustomerDto.email);
      expect(foundCustomer.firstName).toBe(createCustomerDto.firstName);
      expect(foundCustomer.lastName).toBe(createCustomerDto.lastName);
      expect(foundCustomer.fullName).toBe('Integration Test');
      expect(foundCustomer.phone).toBeDefined();
    });
  });

  describe('Edge cases and validations', () => {
    it('should handle empty string validation', async () => {
      const invalidDto = {
        email: '',
        firstName: '',
        lastName: '',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle null values', async () => {
      const invalidDto = {
        email: null,
        firstName: null,
        lastName: null,
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(invalidDto)
        .expect(400);
    });

    it('should trim whitespace from email', async () => {
      const baseEmail = getUniqueEmail('whitespace').replace('@', '');
      const createCustomerDto = {
        email: `  ${baseEmail}@example.com  `,
        firstName: 'Whitespace',
        lastName: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      expect(response.body.email).toBe(`${baseEmail}@example.com`);
    });

    it('should handle special characters in names', async () => {
      const createCustomerDto = {
        email: getUniqueEmail('special'),
        firstName: 'José María',
        lastName: "O'Connor-Smith",
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      expect(response.body.firstName).toBe(createCustomerDto.firstName);
      expect(response.body.lastName).toBe(createCustomerDto.lastName);
      expect(response.body.fullName).toBe("José María O'Connor-Smith");
    });
  });
});
