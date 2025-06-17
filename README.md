# E-commerce Payment API Backend

## 🛍️ Project Overview

A complete e-commerce backend API built with NestJS and TypeScript, featuring integrated payment processing. This project implements a modern hexagonal architecture with comprehensive API documentation.

### 🎯 Business Flow
1. **Product Catalog** → 2. **Payment Form** → 3. **Payment Summary** → 4. **API Processing** → 5. **Result Confirmation**

### ✨ Key Features
- 🛒 Product catalog with real-time stock management
- 💳 Secure payment processing with API integration
- 📦 Order and delivery tracking system
- 🔐 Credit card validation (Visa/Mastercard detection)
- 📱 Mobile-first API design
- 🎯 Railway Oriented Programming (ROP) pattern
- 🏗️ Hexagonal Architecture implementation

## 📚 API Documentation

### 🔗 Swagger Documentation
- **Development**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Production**: https://your-production-url.com/docs

### 📋 Postman Collection
Import the complete Postman collection for testing:
- **Collection**: `postman/E-commerce-API.postman_collection.json`
- **Environment**: `postman/E-commerce-API.postman_environment.json`

#### Quick Import to Postman:
1. Open Postman
2. Click "Import" → "File" 
3. Select both files from the `postman/` directory
4. Update environment variables with your local/production URLs

### 🔧 Available Endpoints

#### Products
- `GET /api/v1/products` - Get all available products (with pagination)
- `GET /api/v1/products/:id` - Get product by ID

#### Customers  
- `POST /api/v1/customers` - Create customer profile
- `GET /api/v1/customers/:id` - Get customer details

#### Transactions
- `POST /api/v1/transactions` - Create transaction (PENDING status)
- `GET /api/v1/transactions/:id` - Get transaction details
- `PATCH /api/v1/transactions/:id/status` - Update transaction status

#### Payments (API Integration)
- `POST /api/v1/payments/process` - Process payment through API
- `POST /api/v1/payments/webhook` - API webhook for status updates

#### Deliveries
- `GET /api/v1/deliveries/:transactionId` - Get delivery status
- `PATCH /api/v1/deliveries/:id/status` - Update delivery status

#### Health Check
- `GET /api/v1/health` - Application health status

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/MayaCris/ecommerce-backend.git
cd ecommerce-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# Setup database (run SQL schema)
psql -U postgres -d your_database -f database/schema.sql

# Start development server
npm run start:dev

# Open API documentation
# Visit: http://localhost:3000/docs
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests  
npm run test:e2e

# Test watch mode
npm run test:watch
```

### Test Coverage Target
- **Minimum Coverage**: 80% (as required)
- **Backend Tests**: Unit + Integration + E2E
- **Frontend Tests**: Component + Integration + E2E

## 🗄️ Database Model

### Core Tables
- **products** - Product catalog with inventory
- **customers** - Customer profiles  
- **delivery_addresses** - Customer delivery addresses
- **transactions** - Payment transactions
- **transaction_items** - Products in each transaction
- **deliveries** - Delivery tracking
- **app_settings** - Application configuration

### Database Views
- **available_products** - Active products with stock > 0
- **transaction_summary** - Transaction overview with customer info

See complete database schema: `database/schema.sql`

## 🔐 API Integration

### Sandbox Configuration
- **Environment**: Sandbox (for development/testing)
- **Supported Cards**: Visa, Mastercard
- **Test Cards**: 
  - Visa: `4242424242424242`
  - Mastercard: `5555555555554444`

### Payment Flow
1. Create transaction with `PENDING` status
2. Submit payment to API
3. Receive webhook notification
4. Update transaction status
5. Update product stock
6. Create delivery record

## 🏗️ Architecture

### Hexagonal Architecture
```
src/
├── modules/
│   ├── products/
│   │   ├── application/     # Use cases & DTOs
│   │   ├── domain/          # Entities & repositories
│   │   ├── infrastructure/  # Database adapters
│   │   └── presentation/    # Controllers & DTOs
│   ├── customers/
│   ├── transactions/
│   ├── payments/
│   └── deliveries/
└── shared/
    ├── application/         # Common DTOs
    ├── domain/             # Shared entities & enums  
    └── infrastructure/     # Config & database
```

### Design Patterns
- **Hexagonal Architecture** - Clean separation of concerns
- **Repository Pattern** - Data access abstraction
- **Railway Oriented Programming** - Error handling
- **CQRS** - Command Query Responsibility Segregation
- **Domain-Driven Design** - Value Objects & Domain Services

## 🎯 Value Objects

### Overview
Value Objects are immutable objects that represent concepts defined by their values rather than their identity. They provide validation, type safety, and domain expressiveness.

### Implemented Value Objects

#### 💰 **Money** (`src/shared/domain/value-objects/monetary/`)
```typescript
const price = new Money(29.99, 'USD');
const tax = new Money(3.00, 'USD');
const total = price.add(tax); // $32.99

// Features:
// ✅ Currency support (USD default)
// ✅ Decimal precision handling
// ✅ Arithmetic operations (add, subtract, multiply)
// ✅ Comparison methods (isGreaterThan, equals)
// ✅ Formatting ($29.99)
// ✅ Validation (no negative amounts)
```

#### 📧 **Email** (`src/shared/domain/value-objects/identity/`)
```typescript
const email = new Email('  USER@EXAMPLE.COM  ');
console.log(email.address); // "user@example.com"
console.log(email.domain);  // "example.com"
console.log(email.localPart); // "user"

// Features:
// ✅ RFC 5322 validation
// ✅ Automatic normalization (lowercase, trim)
// ✅ Domain extraction
// ✅ Free email provider detection
// ✅ Security validations
```

#### 🏷️ **SKU** (`src/shared/domain/value-objects/identity/`)
```typescript
const sku = new SKU('  laptop-pro-16gb  ');
console.log(sku.code); // "LAPTOP-PRO-16GB"

const variant = sku.createVariant('BLACK');
console.log(variant.code); // "LAPTOP-PRO-16GB-BLACK"

// Features:
// ✅ Format validation (alphanumeric + hyphens)
// ✅ Automatic normalization (uppercase, trim)
// ✅ Variant creation
// ✅ Random SKU generation
// ✅ Prefix extraction
```

#### 📦 **Quantity** (`src/shared/domain/value-objects/quantity/`)
```typescript
const stock = new Quantity(100);
const orderQty = new Quantity(25);
const remaining = stock.subtract(orderQty); // 75

console.log(stock.canFulfill(orderQty)); // true

// Features:
// ✅ Integer validation (>= 0)
// ✅ Arithmetic operations
// ✅ Stock availability checks
// ✅ Maximum quantity limits
```

#### 💳 **CardNumber** (`src/shared/domain/value-objects/payment/`)
```typescript
const card = new CardNumber('4532015112830366');
console.log(card.getType());        // "VISA"
console.log(card.getMaskedNumber()); // "**** **** **** 0366"
console.log(card.getLast4Digits()); // "0366"
console.log(card.isValid());        // true

// Security features:
// ✅ Luhn algorithm validation
// ✅ Card type auto-detection (VISA, MASTERCARD, AMEX)
// ✅ Secure masking (never exposes full number)
// ✅ PCI DSS compliance patterns
// ✅ Safe JSON serialization
```

#### 🔒 **CVV** (`src/shared/domain/value-objects/payment/`)
```typescript
const cvv = new CVV('123', CardType.VISA);
console.log(cvv.getMaskedValue());    // "***"
console.log(cvv.getLength());         // 3
console.log(cvv.isValidForCardType()); // true

const amexCvv = CVV.createForAmex('1234');
console.log(amexCvv.getMaskedValue()); // "****"

// Security features:
// ✅ Never stores actual CVV value
// ✅ Card type specific validation (3 digits VISA/MC, 4 digits AMEX)
// ✅ Secure masking for logging
// ✅ Memory clearing capabilities
// ✅ PCI DSS compliance
```

#### 📅 **ExpirationDate** (`src/shared/domain/value-objects/payment/`)
```typescript
const expDate = new ExpirationDate('12/25');
console.log(expDate.getFormattedDate());      // "12/25"
console.log(expDate.getFullYearFormat());     // "12/2025"
console.log(expDate.isExpired());             // false
console.log(expDate.getMonthsUntilExpiration()); // 6

const expDate2 = ExpirationDate.fromMonthYear(6, 2027);

// Features:
// ✅ MM/YY format parsing
// ✅ Expiration validation (not expired)
// ✅ Future date validation (max 10 years)
// ✅ Month/year extraction
// ✅ Time calculations
```

#### 🏠 **Address** (`src/shared/domain/value-objects/address/`)
```typescript
const address = new Address(
  'Carrera 15 #123-45',
  'Bogotá', 
  'Cundinamarca',
  '110111',
  'Colombia'
);

console.log(address.getFullAddress());
console.log(address.isInColombia());    // true
console.log(address.getRegion());       // "Andean"
console.log(address.getShippingLabel());

// Features:
// ✅ Colombian address format validation
// ✅ International address support
// ✅ Geographic region detection
// ✅ Shipping label formatting
// ✅ Postal code integration
```

#### 📫 **PostalCode** (`src/shared/domain/value-objects/address/`)
```typescript
const postal = new PostalCode('110111');
console.log(postal.isColombian());              // true
console.log(postal.getColombianDepartment());   // "Bogotá D.C."
console.log(postal.isInMajorCity());           // true

const usPostal = PostalCode.createUSA('90210');
const caPostal = new PostalCode('K1A 0A9', 'Canada');

// Features:
// ✅ Multi-country validation (Colombia, USA, Canada, UK)
// ✅ Colombian department recognition
// ✅ Major city detection
// ✅ Format normalization
// ✅ Geographic insights
```

#### 📱 **PhoneNumber** (`src/shared/domain/value-objects/identity/`)
```typescript
const phone = new PhoneNumber('3001234567');
console.log(phone.getFormattedNumber());  // "+57 300 123 4567"
console.log(phone.getType());            // "mobile"
console.log(phone.isColombian());        // true
console.log(phone.getLocalFormat());     // "300 123 4567"

const intlPhone = new PhoneNumber('+1 555 123 4567');

// Features:
// ✅ Colombian mobile/landline detection
// ✅ International format support
// ✅ Carrier prefix validation
// ✅ Format normalization
// ✅ Type classification
```

#### 🔢 **TransactionNumber** (`src/shared/domain/value-objects/identity/`)
```typescript
const txn = TransactionNumber.generate();
console.log(txn.getNumber());         // "TXN-20250617-ABC123"
console.log(txn.getShortReference()); // "17-ABC123"
console.log(txn.isFromToday());       // true

const payTxn = TransactionNumber.generate('PAY');

// Features:
// ✅ Unique transaction ID generation
// ✅ Date-based prefixing
// ✅ Short reference generation
// ✅ Custom prefix support
// ✅ Date validation
```


## 🚀 Deployment

### Development
```bash
npm run start:dev
# API: http://localhost:3000/api/v1
# Docs: http://localhost:3000/docs
```

### Production  
```bash
npm run build
npm run start:prod
```

### Docker Support
```bash
# Build image
docker build -t ecommerce-api .

# Run container
docker run -p 3000:3000 ecommerce-api
```

## 🔗 API URLs

### Development
- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/docs

### Production
- **API Base URL**: https://your-domain.com/api/v1
- **Swagger Docs**: https://your-domain.com/docs

## 🤝 Contributing

1. Follow the Git workflow plan: `GIT_WORKFLOW_PLAN.md`
2. Create feature branches from `develop`
3. Use conventional commits
4. Ensure 80%+ test coverage
5. Update API documentation

## 📋 Project Requirements Compliance

✅ **Backend Requirements**
- NestJS with TypeScript
- Hexagonal Architecture  
- Railway Oriented Programming
- PostgreSQL database
- 80%+ test coverage
- Swagger documentation

✅ **Business Requirements**
- Product catalog with stock
- Payment processing with API
- 5-step checkout flow
- Transaction management
- Delivery tracking
- Stock updates

✅ **Integration Requirements**  
- API sandbox integration
- Credit card validation
- Payment webhook handling
- Error handling & resilience


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
