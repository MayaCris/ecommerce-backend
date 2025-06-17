import { AppSettings } from '../entities/app-settings.entity';
import { IBaseRepository } from '../repositories/base.repository.interface';

/**
 * App Settings repository interface
 * Defines all operations available for AppSettings entities
 */
export interface IAppSettingsRepository extends IBaseRepository<AppSettings> {
  /**
   * Find setting by key
   */
  findByKey(key: string): Promise<AppSettings | null>;

  /**
   * Get setting value by key
   */
  getValue(key: string): Promise<string | null>;

  /**
   * Set setting value
   */
  setValue(
    key: string,
    value: string,
    description?: string,
  ): Promise<AppSettings>;

  /**
   * Find all settings with keys matching pattern
   */
  findByKeyPattern(pattern: string): Promise<AppSettings[]>;

  /**
   * Get settings as key-value object
   */
  getAllAsObject(): Promise<Record<string, string>>;

  /**
   * Bulk update settings
   */
  bulkUpdate(settings: Record<string, string>): Promise<AppSettings[]>;
}
