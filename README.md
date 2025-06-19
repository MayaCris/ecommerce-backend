# E-commerce Payment API Backend

## 🛍️ Project Overview

A complete e-commerce backend API built with NestJS and TypeScript, featuring integrated payment processing. This project implements a modern hexagonal architecture with comprehensive API documentation.

### 🎯 Business Flow
1. **Product Catalog** → 2. **Payment Form** → 3. **Payment Summary** → 4. **API Processing** → 5. **Result Confirmation**

### ✨ Key Features
- 🛒 **Advanced Product Catalog**: Real-time inventory management with sophisticated stock control
- 💳 **Secure Payment Processing**: Full integration with payment gateways using modern security patterns
- 📦 **Comprehensive Order Management**: Complete order lifecycle from creation to delivery
- 🔐 **Robust Security**: Advanced credit card validation with secure tokenization
- 🏗️ **Enterprise Architecture**: Hexagonal architecture with clean separation of concerns
- 🎯 **Error Resilience**: Railway Oriented Programming for robust error handling
- 📊 **Value Objects**: Rich domain modeling with extensive validation
- 🔄 **Event-Driven Design**: Asynchronous processing capabilities
- 📱 **API-First Design**: Comprehensive OpenAPI/Swagger documentation

## 📚 API Documentation

### 🔗 Swagger Documentation
- **Development**: [http://localhost:3000/docs](http://localhost:3000/docs)

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

#### 🛒 Products API
- `GET /api/v1/products` - Get all available products (with pagination and search)
- `GET /api/v1/products/:id` - Get detailed product information by ID
- `POST /api/v1/products` - Create new product (admin functionality)

#### 👥 Customers API
- `POST /api/v1/customers` - Create customer profile with validation
- `GET /api/v1/customers` - Get all customers (admin functionality)
- `GET /api/v1/customers/:id` - Get customer details and order history

#### 🏪 Transactions API
- `POST /api/v1/transactions` - Create transaction (PENDING status)
- `GET /api/v1/transactions` - Get all transactions with pagination
- `GET /api/v1/transactions/:id` - Get transaction details
- `GET /api/v1/transactions/customer/:customerId` - Get customer transactions
- `PATCH /api/v1/transactions/:id/status` - Update transaction status

#### 🛒 Transaction Items API
- `GET /api/v1/transaction-items` - Get all transaction items
- `POST /api/v1/transaction-items` - Add items to transaction
- `GET /api/v1/transaction-items/by-transaction/:transactionId` - Get items by transaction
- `GET /api/v1/transaction-items/by-product/:productId` - Get items by product

#### 💳 Payments API (Gateway Integration)
- `POST /api/v1/payments/cards/tokens` - Create secure card token
- `POST /api/v1/payments/process` - Process payment through gateway
- `GET /api/v1/payments/:paymentId/status` - Get payment status
- `POST /api/v1/payments/webhook` - Handle payment gateway webhooks

#### 🚚 Deliveries API
- `POST /api/v1/deliveries` - Create delivery record
- `GET /api/v1/deliveries` - Get all deliveries with filtering
- `GET /api/v1/deliveries/:transactionId` - Get delivery status by transaction
- `PATCH /api/v1/deliveries/:id/status` - Update delivery status

#### 📍 Delivery Addresses API
- `POST /api/v1/delivery-addresses` - Create delivery address
- `GET /api/v1/delivery-addresses` - Get delivery addresses with filtering
- `GET /api/v1/delivery-addresses/customer/:customerId` - Get customer addresses

#### ⚡ Health & Monitoring
- `GET /api/v1/health` - Comprehensive application health status
- `GET /` - Basic application status check

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

# Database setup note:
# The application uses TypeORM entities to manage database schema
# No manual SQL schema file is needed - entities auto-create tables

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

## 🗄️ Database Architecture & Model

### 🔧 Database Configuration
- **Database Engine**: CockroachDB (PostgreSQL-compatible) 
- **ORM**: TypeORM with entity-based mapping
- **Connection Management**: Optimized connection pooling
- **Environment Support**: Development, staging, and production configurations

### 📊 Core Database Schema

#### **Products Table** (`products`)
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **Customers Table** (`customers`)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **Delivery Addresses Table** (`delivery_addresses`)
```sql
CREATE TABLE delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Colombia',
    additional_info TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, is_default) WHERE is_default = true
);
```

#### **Transactions Table** (`transactions`)
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    delivery_address_id UUID NOT NULL REFERENCES delivery_addresses(id),
    subtotal DECIMAL(10,2) NOT NULL,
    base_fee DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    api_transaction_id VARCHAR(100),
    api_reference VARCHAR(100),
    card_type card_type_enum,
    card_last_four_digits CHAR(4),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **Transaction Items Table** (`transaction_items`)
```sql
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **Payments Table** (`payments`)
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    reference VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    customer_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    method payment_method DEFAULT 'CARD',
    status payment_status DEFAULT 'PENDING',
    api_transaction_id VARCHAR(255),
    api_reference VARCHAR(255),
    status_message TEXT,
    processing_date TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **Deliveries Table** (`deliveries`)
```sql
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID UNIQUE NOT NULL REFERENCES transactions(id),
    delivery_address_id UUID NOT NULL REFERENCES delivery_addresses(id),
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    status delivery_status DEFAULT 'PENDING',
    estimated_delivery_date DATE,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **Application Settings Table** (`app_settings`)
```sql
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 📈 Database Performance Optimizations

#### **Indexes Strategy**
```sql
-- Customer email lookup
CREATE UNIQUE INDEX idx_customers_email ON customers(email);

-- Transaction lookups
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE UNIQUE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Delivery tracking
CREATE UNIQUE INDEX idx_deliveries_transaction_id ON deliveries(transaction_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_tracking_number ON deliveries(tracking_number);

-- Address management
CREATE INDEX idx_delivery_addresses_customer_id ON delivery_addresses(customer_id);
CREATE UNIQUE INDEX idx_delivery_addresses_default 
    ON delivery_addresses(customer_id, is_default) 
    WHERE is_default = true;

-- Product catalog performance
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(stock_quantity);
```


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

## 🏗️ Software Architecture

### 🔷 Hexagonal Architecture (Ports & Adapters)
```
src/
├── modules/                          # Business Modules
│   ├── products/                     # Product Catalog Domain
│   │   ├── application/              # Use Cases & Application Services
│   │   │   ├── dto/                  # Application DTOs
│   │   │   ├── ports/                # Interface Definitions
│   │   │   └── use-cases/            # Business Logic Implementation
│   │   ├── domain/                   # Core Business Logic
│   │   │   ├── entities/             # Domain Entities & Aggregates
│   │   │   ├── repositories/         # Repository Interfaces
│   │   │   └── services/             # Domain Services
│   │   ├── infrastructure/           # Technical Implementation
│   │   │   ├── adapters/             # External Service Adapters
│   │   │   └── persistence/          # Database Implementation
│   │   │       ├── entities/         # TypeORM Entities
│   │   │       ├── mappers/          # Domain ↔ Persistence Mapping
│   │   │       └── repositories/     # Repository Implementation
│   │   └── presentation/             # API Layer
│   │       ├── controllers/          # REST Controllers
│   │       └── dto/                  # Request/Response DTOs
│   ├── customers/                    # Customer Management Domain
│   ├── transactions/                 # Transaction Processing Domain
│   ├── payments/                     # Payment Gateway Integration
│   └── deliveries/                   # Order Fulfillment Domain
└── shared/                           # Shared Components
    ├── application/                  # Common Application Services
    │   ├── common/                   # Shared Application Logic
    │   ├── dto/                      # Common DTOs
    │   └── ports/                    # Shared Interface Definitions
    ├── domain/                       # Shared Domain Components
    │   ├── entities/                 # Base Entities & Common Models
    │   ├── enums/                    # Domain Enumerations
    │   ├── exceptions/               # Custom Domain Exceptions
    │   ├── repositories/             # Base Repository Interfaces
    │   ├── services/                 # Shared Domain Services
    │   └── value-objects/            # Rich Domain Value Objects
    └── infrastructure/               # Shared Infrastructure
        ├── config/                   # Configuration Management
        ├── database/                 # Database Setup & Migrations
        └── http/                     # HTTP Infrastructure
```

### 🎯 Design Patterns Implementation

#### **1. Repository Pattern**
- **Purpose**: Abstract data access layer from business logic
- **Implementation**: Interface-based repository contracts
- **Benefits**: Testability, technology independence, clean separation

#### **2. Domain-Driven Design (DDD)**
- **Entities**: Rich domain models with business logic
- **Value Objects**: Immutable objects representing domain concepts
- **Aggregates**: Consistency boundaries for related entities
- **Domain Services**: Complex business logic coordination

#### **3. CQRS (Command Query Responsibility Segregation)**
- **Commands**: State-changing operations (Create, Update, Delete)
- **Queries**: Read-only operations with optimized data access
- **Separation**: Clear distinction between write and read models

#### **4. Railway Oriented Programming (ROP)**
- **Error Handling**: Functional approach to error management
- **Result Types**: Success/Error result patterns
- **Composition**: Chainable operations with automatic error propagation

#### **5. Factory Pattern**
- **Domain Entity Creation**: Consistent object instantiation
- **Value Object Construction**: Validated object creation
- **Use Case Factory**: Service instantiation with dependencies

#### **6. Mapper Pattern**
- **Data Transformation**: Clean conversion between layers
- **Type Safety**: Compile-time validation of mappings
- **Separation of Concerns**: Isolated mapping logic

### 🔧 Dependency Injection & IoC

#### **Interface Segregation**
- Small, focused interfaces
- Single responsibility principle
- Easy testing and mocking

### 🔄 Cross-Cutting Concerns

#### **Configuration Management**
- Environment-based configuration
- Type-safe configuration objects
- Validation at startup

#### **Logging & Monitoring**
- Structured logging with context
- Performance monitoring
- Error tracking and alerting

#### **Security**
- Input validation at all layers
- SQL injection prevention
- Secure credential handling

#### **Error Handling**
- Global exception filters
- Domain-specific error types
- Consistent error responses

## 🚀 Deployment

### Development
```bash
npm run start:dev
# API: http://localhost:3000/api/v1
# Docs: http://localhost:3000/docs
```

## 🌟 Technical Highlights

### Advanced Features Implemented
- **🏗️ Hexagonal Architecture**: Clean separation between business logic and infrastructure
- **💎 Rich Domain Model**: 18+ sophisticated Value Objects with extensive validation
- **🔄 Railway Oriented Programming**: Functional error handling with neverthrow library
- **🛡️ Type Safety**: 100% TypeScript with strict mode for compile-time error prevention
- **🔒 Security-First Design**: PCI DSS compliant payment handling with secure tokenization
- **📊 Performance Optimized**: Strategic database indexing and connection pooling
- **🧪 Comprehensive Testing**: Unit, integration, and E2E tests with 80%+ coverage
- **📱 API-First Approach**: Complete OpenAPI 3.0 documentation with Swagger UI
- **🔧 Configuration Management**: Environment-based config with validation
- **🚀 Production Ready**: Optimized for deployment with proper error handling

### Business Value Delivered
- **💰 Payment Processing**: Complete e-commerce transaction lifecycle
- **📦 Inventory Management**: Real-time stock control with atomic updates
- **🛒 Shopping Experience**: From product catalog to delivery tracking
- **🔐 Compliance**: Secure payment processing following industry standards
- **📈 Scalability**: Architecture designed for horizontal scaling
- **🔍 Observability**: Structured logging and monitoring capabilities


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
