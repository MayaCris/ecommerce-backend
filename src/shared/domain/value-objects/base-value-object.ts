/**
 * Base class for all Value Objects in the domain.
 * Value Objects are immutable objects that represent concepts
 * defined by their values rather than their identity.
 */
export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = Object.freeze(value);
  }

  /**
   * Gets the value of the Value Object
   */
  public get value(): T {
    return this._value;
  }

  /**
   * Checks equality between two Value Objects
   */
  public equals(other: ValueObject<T>): boolean {
    if (!other || other.constructor !== this.constructor) {
      return false;
    }

    return this.deepEquals(this._value, other._value);
  }

  /**
   * Returns a string representation of the Value Object
   */
  public toString(): string {
    return JSON.stringify(this._value);
  }

  /**
   * Returns the JSON representation of the Value Object
   */
  public toJSON(): T {
    return this._value;
  }

  /**
   * Deep equality comparison for complex objects
   */
  private deepEquals(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a == null || b == null) return false;

    if (typeof a !== typeof b) return false;

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a as Record<string, unknown>);
      const keysB = Object.keys(b as Record<string, unknown>);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (
          !this.deepEquals(
            (a as Record<string, unknown>)[key],
            (b as Record<string, unknown>)[key],
          )
        )
          return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Validates the value according to the specific Value Object rules
   */
  protected abstract validate(value: T): void;
}
