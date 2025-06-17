import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ApiResponseDto } from '../../../../shared/application/dto/api-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
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
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): ApiResponseDto<ProductResponseDto[]> {
    // TODO: Implementation will be added later
    // Using page, limit, search for future implementation
    console.log('Query params:', { page, limit, search });

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: [],
      timestamp: new Date().toISOString(),
    };
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
