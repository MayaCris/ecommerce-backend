import { ConfigService } from '@nestjs/config';

export interface ApiExternaConfig {
  baseUrl: string;
  publicKey: string;
  privateKey: string;
  eventsKey: string;
  integrityKey: string;
  isSandbox: boolean;
}

export const getApiExternaConfig = (
  configService: ConfigService,
): ApiExternaConfig => {
  const isSandbox = configService.get<string>('NODE_ENV') !== 'production';

  // Get all required configuration values
  const baseUrl = configService.get<string>('API_BASE_URL');
  const publicKey = configService.get<string>('API_PUBLIC_KEY');
  const privateKey = configService.get<string>('API_PRIVATE_KEY');
  const eventsKey = configService.get<string>('API_EVENTS_KEY');
  const integrityKey = configService.get<string>('API_INTEGRITY_KEY');

  // Validate that all required configuration is present
  const missingVars: string[] = [];
  if (!baseUrl) missingVars.push('API_BASE_URL');
  if (!publicKey) missingVars.push('API_PUBLIC_KEY');
  if (!privateKey) missingVars.push('API_PRIVATE_KEY');
  if (!eventsKey) missingVars.push('API_EVENTS_KEY');
  if (!integrityKey) missingVars.push('API_INTEGRITY_KEY');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required External API configuration in environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env file and ensure all API_* variables are properly set.',
    );
  }

  return {
    baseUrl: baseUrl!,
    publicKey: publicKey!,
    privateKey: privateKey!,
    eventsKey: eventsKey!,
    integrityKey: integrityKey!,
    isSandbox,
  };
};
