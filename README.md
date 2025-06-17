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
git clone <repository-url>
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
