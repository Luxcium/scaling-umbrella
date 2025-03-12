/**
 * Core type definitions for Settled types and interfaces
 * @module types/core/Settled
 */

/**
 * Base type that represents the aggregation of possible input types
 * Supports raw values, settled results, and promise results
 */
export type Base<TBase> =
  | TBase
  | Settled<TBase>
  | PromiseSettledResult<TBase>
  | SettledRight<TBase>
  | PromiseFulfilledResult<TBase>
  | SettledLeft
  | PromiseRejectedResult;

/**
 * Union type for successful and failed settled results
 */
export type Settled<T> = SettledRight<T> | SettledLeft;

/**
 * Interface for successful transformation results
 * Includes additional metadata for tracking transformation progress
 */
export interface SettledRight<T> extends PromiseFulfilledResult<T> {
  status: 'fulfilled';
  value: T;

  /**
   * The null value of the transformStep is -1
   * When value is -1 the following properties are not enumerated
   */
  transformStep: number;
  index: number;

  /** Following properties are not enumerated (enumerable: false) */
  currentRejection: null;
  fulfilled: T;
  rejected: null;
  reason?: undefined;
}

/**
 * Interface for unsuccessful transformation results
 * Includes rejection status and transformation metadata
 */
export interface SettledLeft extends PromiseRejectedResult {
  status: 'rejected';
  reason: any;

  /**
   * The currentRejection can be undefined but the property itself
   * cannot be undefined
   */
  currentRejection: true | false | undefined;

  /**
   * The null value of the transformStep is -1
   * When value is -1 the following properties are not enumerated
   */
  transformStep: number;
  index: number;

  /** Following properties are not enumerated (enumerable: false) */
  rejected: any;
  fulfilled: null;
  value?: undefined;
}

/**
 * Collection type for iterables of Base values
 */
export type Collection<B> = Iterable<Base<B>>;

/**
 * Type for values that may be either immediate or promise-based
 */
export type AwaitAndBase<B> = Base<B> | PromiseLike<Base<B>>;

/**
 * Type alias for void return type indicating only side effects
 */
export type OnlySideEffect = void;

/**
 * Transform delegate function type
 * Responsible for transforming input type T to output type U
 */
export interface TransformFn<T, U = unknown> {
  (
    _value: T,
    _index: number,
    _array: readonly (T | PromiseSettledResult<T>)[]
  ): Promise<U>;
}

/**
 * Lookup delegate function type for acknowledging transformed values
 * Must only produce side effects and return void
 */
export interface LookupFn<S, U = unknown> {
  (
    _value: U,
    _index: number,
    _array: readonly (S | Settled<S> | PromiseSettledResult<S>)[]
  ): OnlySideEffect;
}

/**
 * Validate delegate function type
 * Similar to LookupFn but awaited and can throw for validation failures
 */
export interface ValidateFn<S, U = unknown> {
  (
    _value: U,
    _index: number,
    _array: readonly (S | PromiseSettledResult<S>)[]
  ): Promise<OnlySideEffect>;
}

/**
 * Error lookup delegate function type
 * Handles error cases with currentRejection status
 */
export interface ErrLookupFn {
  (_reason: any, _index: number, _currentRejection: boolean): OnlySideEffect;
}
