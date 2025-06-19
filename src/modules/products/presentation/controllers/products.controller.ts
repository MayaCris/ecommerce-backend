import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProductResponseDto } from '../dto/product-response.dto';
import { CreateProductRequestDto } from '../dto/create-product-request.dto';
import { ApiResponseDto } from '../../../../shared/application/dto/api-response.dto';
import {
  CreateProductUseCase,
  CreateProductDto,
} from '../../application/use-cases/create-product.use-case';
import {
  GetProductsUseCase,
  GetProductsOptions,
} from '../../application/use-cases/get-products.use-case';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY_TOKEN } from '../../products.tokens';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product with Value Objects validation',
  })
  @ApiBody({ type: CreateProductRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createProduct(@Body() request: CreateProductRequestDto) {
    try {
      // Convert presentation DTO to use case DTO
      const createProductDto: CreateProductDto = {
        name: request.name,
        description: request.description,
        price: request.price,
        stock: request.stock,
        sku: request.sku,
        imageUrl: request.imageUrl || '',
        isActive: request.isActive ?? true,
      };

      const product = await this.createProductUseCase.execute(createProductDto);
      return {
        success: true,
        message: 'Product created successfully',
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.amount,
          currency: product.price.currency,
          stock: product.stock.amount,
          sku: product.sku.code,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to create product',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
  @Get()
  @ApiOperation({
    summary: 'Get all available products',
    description: `
      Retrieves a list of all active products with available stock.
      This endpoint returns products that customers can purchase.
      
      **Business Rules:**
      - Only active products (is_active = true)
      - Only products with stock > 0
      - Results are paginated for performance
      
      **Use Case:** 
      Display product catalog on the main shopping page.
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products per page (max 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search products by name or description',
    example: 'smartphone',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ApiResponseDto<ProductResponseDto[]>,
    schema: {
      example: {
        success: true,
        message: 'Products retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Smartphone Premium',
            description: 'Latest generation smartphone with advanced features',
            price: 899.99,
            stockQuantity: 25,
            sku: 'PHONE-001',
            imageUrl: 'https://example.com/images/smartphone.jpg',
            isActive: true,
            createdAt: '2025-06-16T12:00:00.000Z',
            updatedAt: '2025-06-16T12:00:00.000Z',
          },
        ],
        timestamp: '2025-06-16T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve products',
        error: 'Database connection error',
        timestamp: '2025-06-16T12:00:00.000Z',
      },
    },
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    try {
      const options: GetProductsOptions = {
        page: Number(page),
        limit: Number(limit),
        search,
        includeInactive: false, // Business rule: only show active products
      };

      const result = await this.getProductsUseCase.execute(options);

      return {
        success: true,
        message: 'Products retrieved successfully',
        data: result.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.amount,
          currency: product.price.currency,
          stockQuantity: product.stock.amount,
          sku: product.sku.code,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to retrieve products',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: `
      Retrieves detailed information about a specific product by its ID.
      
      **Business Rules:**
      - Product must exist and be active
      - Returns current stock information
      
      **Use Case:** 
      Display product details page with current stock and pricing.
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Product unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ApiResponseDto<ProductResponseDto>,
    schema: {
      example: {
        success: true,
        message: 'Product retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Smartphone Premium',
          description: 'Latest generation smartphone with advanced features',
          price: 899.99,
          stockQuantity: 25,
          sku: 'PHONE-001',
          imageUrl: 'https://example.com/images/smartphone.jpg',
          isActive: true,
          createdAt: '2025-06-16T12:00:00.000Z',
          updatedAt: '2025-06-16T12:00:00.000Z',
        },
        timestamp: '2025-06-16T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        success: false,
        message: 'Product not found',
        error: 'Product with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        timestamp: '2025-06-16T12:00:00.000Z',
      },
    },
  })
  findOne(@Param('id') id: string): ApiResponseDto<ProductResponseDto> {
    // TODO: Implementation will be added later
    // Using id parameter for future implementation
    console.log('Product ID:', id);

    return {
      success: true,
      message: 'Product retrieved successfully',
      data: {} as ProductResponseDto,
      timestamp: new Date().toISOString(),
    };
  }
}
