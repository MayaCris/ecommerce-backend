import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'E-commerce API with API payment integration is running!';
  }

  async getHealth() {
    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        error: errorMessage,
      };
    }
  }
}
