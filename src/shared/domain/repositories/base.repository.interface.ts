/**
 * Base repository interface with common CRUD operations
 * All specific repository interfaces should extend this
 */
export interface IBaseRepository<T, ID = string> {
  /**
   * Find entity by ID
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Find all entities with optional filtering
   */
  findAll(options?: FindOptions<T>): Promise<T[]>;

  /**
   * Create new entity
   */
  create(entity: Partial<T>): Promise<T>;

  /**
   * Update existing entity
   */
  update(id: ID, updates: Partial<T>): Promise<T | null>;

  /**
   * Delete entity by ID
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Check if entity exists
   */
  exists(id: ID): Promise<boolean>;

  /**
   * Count total entities with optional filtering
   */
  count(options?: FindOptions<T>): Promise<number>;
}

/**
 * Generic find options for repository queries
 */
export interface FindOptions<T> {
  where?: Partial<T>;
  limit?: number;
  offset?: number;
  orderBy?: keyof T;
  orderDirection?: 'ASC' | 'DESC';
}
