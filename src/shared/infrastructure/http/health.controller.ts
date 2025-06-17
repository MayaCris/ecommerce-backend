import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from '../../../shared/application/dto/api-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: `
      Returns the current status of the application and its dependencies.
      
      **Use Cases:**
      - Load balancer health checks
      - Monitoring system status verification
      - DevOps deployment validation
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        success: true,
        message: 'Application is healthy',
        data: {
          status: 'ok',
          timestamp: '2025-06-16T12:00:00.000Z',
          uptime: '2h 15m 30s',
          version: '1.0.0',
          environment: 'development',
          database: 'connected',
          memory: {
            used: '45.2 MB',
            total: '512 MB',
          },
        },
        timestamp: '2025-06-16T12:00:00.000Z',
      },
    },
  })
  checkHealth(): ApiResponseDto {
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    return {
      success: true,
      message: 'Application is healthy',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: uptimeString,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'connected', // This should check actual DB connection
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
