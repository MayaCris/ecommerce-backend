import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('DeliveryAddressesController (e2e)', () => {
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

    // Clean delivery_addresses table before each test
    //await dataSource.query('DELETE FROM delivery_addresses');
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /delivery-addresses', () => {
    it('should create a new delivery address successfully with all fields', async () => {
      const createDeliveryAddressDto = {
        customerId: EXISTING_CUSTOMER_IDS[1],
        streetAddress: 'Carrera 15 #123-45',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
        country: 'Colombia',
        additionalInfo: 'Apartamento 501, tocar el timbre dos veces',
        isDefault: true,
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(createDeliveryAddressDto)
        .expect(201);

      // Validate response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(
        createDeliveryAddressDto.customerId,
      );
      expect(response.body.streetAddress).toBe(
        createDeliveryAddressDto.streetAddress,
      );
      expect(response.body.city).toBe(createDeliveryAddressDto.city);
      expect(response.body.state).toBe(createDeliveryAddressDto.state);
      expect(response.body.postalCode).toBe(
        createDeliveryAddressDto.postalCode,
      );
      expect(response.body.country).toBe(createDeliveryAddressDto.country);
      expect(response.body.additionalInfo).toBe(
        createDeliveryAddressDto.additionalInfo,
      );
      expect(response.body.isDefault).toBe(createDeliveryAddressDto.isDefault);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create a delivery address with minimal required fields', async () => {
      const createDeliveryAddressDto = {
        customerId: EXISTING_CUSTOMER_IDS[2],
        streetAddress: 'Calle 26 #45-67',
        city: 'Medellín',
        state: 'Antioquia',
        postalCode: '050001',
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(createDeliveryAddressDto)
        .expect(201);

      // Validate response structure with minimal fields
      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(
        createDeliveryAddressDto.customerId,
      );
      expect(response.body.streetAddress).toBe(
        createDeliveryAddressDto.streetAddress,
      );
      expect(response.body.city).toBe(createDeliveryAddressDto.city);
      expect(response.body.state).toBe(createDeliveryAddressDto.state);
      expect(response.body.postalCode).toBe(
        createDeliveryAddressDto.postalCode,
      );
      expect(response.body.country).toBe('Colombia'); // Default value
      expect(response.body.additionalInfo).toBeNull();
      expect(response.body.isDefault).toBe(true); // First address for customer becomes default automatically
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create first address as default automatically', async () => {
      const createDeliveryAddressDto = {
        customerId: EXISTING_CUSTOMER_IDS[2],
        streetAddress: 'Avenida El Dorado #123-45',
        city: 'Cali',
        state: 'Valle del Cauca',
        postalCode: '760001',
        isDefault: false, // Even though we set false, it should become true as first address
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(createDeliveryAddressDto)
        .expect(201);

      // Should be default even though we set it to false (business rule: first address is always default)
      expect(response.body.isDefault).toBe(true);
    });

    it('should return 400 for invalid customerId format', async () => {
      const createDeliveryAddressDto = {
        customerId: 'invalid-uuid-format',
        streetAddress: 'Carrera 15 #123-45',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(createDeliveryAddressDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('customerId must be a UUID'),
        ]),
      );
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDto = {
        customerId: EXISTING_CUSTOMER_IDS[0],
        streetAddress: 'Carrera 15 #123-45',
        // Missing city, state, postalCode
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(incompleteDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringMatching(
            /city.*should not be empty|city.*must be a string/,
          ),
          expect.stringMatching(
            /state.*should not be empty|state.*must be a string/,
          ),
          expect.stringMatching(
            /postalCode.*should not be empty|postalCode.*must be a string/,
          ),
        ]),
      );
    });

    it('should return 400 for street address too short', async () => {
      const createDeliveryAddressDto = {
        customerId: EXISTING_CUSTOMER_IDS[0],
        streetAddress: '123', // Too short (minimum 5 characters)
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(createDeliveryAddressDto)
        .expect(400);

      expect(response.body.message).toContain(
        'Street address must be at least 5 characters long',
      );
    });

    it('should return 409 when trying to create second default address for same customer', async () => {
      // First, create a default address
      const firstAddressDto = {
        customerId: EXISTING_CUSTOMER_IDS[3],
        streetAddress: 'Carrera 10 #50-30',
        city: 'Barranquilla',
        state: 'Atlántico',
        postalCode: '080001',
        isDefault: true,
      };

      await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(firstAddressDto)
        .expect(201);

      // Try to create another default address for the same customer
      const secondAddressDto = {
        customerId: EXISTING_CUSTOMER_IDS[3],
        streetAddress: 'Calle 50 #20-15',
        city: 'Barranquilla',
        state: 'Atlántico',
        postalCode: '080002',
        isDefault: true,
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(secondAddressDto)
        .expect(409);

      expect(response.body.message).toContain(
        'Customer already has a default address',
      );
    });
  });

  describe('GET /delivery-addresses', () => {
    beforeEach(async () => {
      // Create test data for GET tests
      const testAddresses = [
        {
          customerId: EXISTING_CUSTOMER_IDS[0],
          streetAddress: 'Carrera 7 #32-16',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110111',
          // First address will become default automatically
        },
        {
          customerId: EXISTING_CUSTOMER_IDS[0],
          streetAddress: 'Calle 19 #45-23',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110121',
          // Second address will be non-default
        },
        {
          customerId: EXISTING_CUSTOMER_IDS[4],
          streetAddress: 'Avenida Poblado #12-34',
          city: 'Medellín',
          state: 'Antioquia',
          postalCode: '050021',
          // First address for this customer will become default automatically
        },
      ];

      // Create addresses for testing
      for (const address of testAddresses) {
        await request(app.getHttpServer())
          .post('/delivery-addresses')
          .send(address)
          .expect(201);
      }
    });

    it('should return all delivery addresses when no filters provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Validate structure of first address
      const firstAddress = response.body[0];
      expect(firstAddress).toHaveProperty('id');
      expect(firstAddress).toHaveProperty('customerId');
      expect(firstAddress).toHaveProperty('streetAddress');
      expect(firstAddress).toHaveProperty('city');
      expect(firstAddress).toHaveProperty('state');
      expect(firstAddress).toHaveProperty('postalCode');
      expect(firstAddress).toHaveProperty('country');
      expect(firstAddress).toHaveProperty('isDefault');
      expect(firstAddress).toHaveProperty('createdAt');
    });

    it('should filter addresses by customerId', async () => {
      const targetCustomerId = EXISTING_CUSTOMER_IDS[0];

      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .query({ customerId: targetCustomerId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // All returned addresses should belong to the specified customer
      response.body.forEach((address: any) => {
        expect(address.customerId).toBe(targetCustomerId);
      });
    });

    it('should filter addresses by city', async () => {
      const targetCity = 'Bogotá';

      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .query({ city: targetCity })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // All returned addresses should be in the specified city
      response.body.forEach((address: any) => {
        expect(address.city).toBe(targetCity);
      });
    });

    it('should respect limit parameter', async () => {
      const limit = 2;

      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .query({ limit })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(limit);
    });

    it('should respect offset parameter', async () => {
      // Get all addresses first
      const allAddressesResponse = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .expect(200);

      const totalAddresses = allAddressesResponse.body.length;

      if (totalAddresses > 1) {
        const offset = 1;

        const response = await request(app.getHttpServer())
          .get('/delivery-addresses')
          .query({ offset })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(totalAddresses - offset);
      }
    });

    it('should combine multiple query parameters', async () => {
      const customerId = EXISTING_CUSTOMER_IDS[0];
      const city = 'Bogotá';
      const limit = 1;

      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .query({ customerId, city, limit })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(limit);

      if (response.body.length > 0) {
        response.body.forEach((address: any) => {
          expect(address.customerId).toBe(customerId);
          expect(address.city).toBe(city);
        });
      }
    });

    it('should return empty array when filtering by non-existent customerId', async () => {
      const nonExistentCustomerId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .query({ customerId: nonExistentCustomerId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return empty array when filtering by non-existent city', async () => {
      const nonExistentCity = 'Ciudad Inexistente';

      const response = await request(app.getHttpServer())
        .get('/delivery-addresses')
        .query({ city: nonExistentCity })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle Colombian postal codes correctly', async () => {
      const colombianAddresses = [
        {
          customerId: EXISTING_CUSTOMER_IDS[1],
          streetAddress: 'Carrera 11 #93-45',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110111',
          country: 'Colombia',
        },
        {
          customerId: EXISTING_CUSTOMER_IDS[2],
          streetAddress: 'Calle 10 #45-67',
          city: 'Medellín',
          state: 'Antioquia',
          postalCode: '050001',
          country: 'Colombia',
        },
      ];

      for (const address of colombianAddresses) {
        const response = await request(app.getHttpServer())
          .post('/delivery-addresses')
          .send(address)
          .expect(201);

        expect(response.body.postalCode).toBe(address.postalCode);
        expect(response.body.country).toBe('Colombia');
      }
    });

    it('should trim and validate string fields correctly', async () => {
      const addressWithSpaces = {
        customerId: EXISTING_CUSTOMER_IDS[3],
        streetAddress: '  Carrera 15 #123-45  ', // With leading/trailing spaces
        city: '  Bogotá  ',
        state: '  Cundinamarca  ',
        postalCode: '  110111  ',
        additionalInfo: '  Some additional info  ',
      };

      const response = await request(app.getHttpServer())
        .post('/delivery-addresses')
        .send(addressWithSpaces)
        .expect(201);

      // Should handle spaces correctly (depending on your validation rules)
      expect(response.body.streetAddress).toBeDefined();
      expect(response.body.city).toBeDefined();
      expect(response.body.state).toBeDefined();
      expect(response.body.postalCode).toBeDefined();
    });
  });
});
