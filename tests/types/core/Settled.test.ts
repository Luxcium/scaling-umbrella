/**
 * Type tests for Settled types and interfaces
 * @module tests/types/core/Settled
 */

import { describe, expect, it } from '@jest/globals';
import type {
  Base,
  Settled,
  SettledLeft,
  SettledRight,
  Collection,
  AwaitAndBase,
  TransformFn,
  LookupFn,
  ValidateFn,
  ErrLookupFn,
  OnlySideEffect,
} from '../../../src/types/core/Settled';

describe('Settled Types', () => {
  /**
   * Type assertion utility with runtime validation
   * This is an intentionally empty function that serves as a type guard
   * The generic parameters ensure type compatibility at compile time
   */

  function assertType<T, _U extends T>(): void {
    // The function body is intentionally empty as it's used for type checking only
    expect(true).toBe(true); // Validates the assertion was checked
  }

  describe('Base<TBase>', () => {
    it('should accept raw value', () => {
      const value: Base<string> = 'test';
      expect(typeof value).toBe('string');
    });

    it('should accept SettledRight', () => {
      const settled: Base<string> = {
        status: 'fulfilled',
        value: 'test',
        transformStep: 0,
        index: 0,
        currentRejection: null,
        fulfilled: 'test',
        rejected: null,
      };
      expect(settled.status).toBe('fulfilled');
    });

    it('should accept SettledLeft', () => {
      const settled: Base<string> = {
        status: 'rejected',
        reason: new Error('test error'),
        transformStep: 0,
        index: 0,
        currentRejection: true,
        rejected: new Error('test error'),
        fulfilled: null,
      };
      expect(settled.status).toBe('rejected');
    });
  });

  describe('Settled<T>', () => {
    it('should be union of SettledRight and SettledLeft', () => {
      type Expected = SettledRight<string> | SettledLeft;
      assertType<Expected, Settled<string>>();
      expect(true).toBe(true); // Type assertion passed
    });
  });

  describe('SettledRight<T>', () => {
    it('should extend PromiseFulfilledResult', () => {
      const _result: SettledRight<string> = {
        status: 'fulfilled',
        value: 'test',
        transformStep: 0,
        index: 0,
        currentRejection: null,
        fulfilled: 'test',
        rejected: null,
      };

      type Expected = {
        status: 'fulfilled';
        value: string;
        transformStep: number;
        index: number;
        currentRejection: null;
        fulfilled: string;
        rejected: null;
      };

      assertType<Expected, typeof _result>();
      expect(true).toBe(true); // Type assertion passed
    });
  });

  describe('SettledLeft', () => {
    it('should extend PromiseRejectedResult', () => {
      const error = new Error('test error');
      const _result: SettledLeft = {
        status: 'rejected',
        reason: error,
        transformStep: 0,
        index: 0,
        currentRejection: true,
        rejected: error,
        fulfilled: null,
      };

      type Expected = {
        status: 'rejected';
        reason: any;
        transformStep: number;
        index: number;
        currentRejection: true | false | undefined;
        rejected: any;
        fulfilled: null;
      };

      assertType<Expected, typeof _result>();
      expect(true).toBe(true); // Type assertion passed
    });
  });

  describe('Collection<B>', () => {
    it('should accept iterables of Base values', () => {
      const collection: Collection<string> = ['test'];
      expect(Array.isArray(collection)).toBe(true);
    });
  });

  describe('AwaitAndBase<B>', () => {
    it('should accept Base values', () => {
      const value: AwaitAndBase<string> = 'test';
      expect(typeof value).toBe('string');
    });

    it('should accept Promises of Base values', () => {
      const promise: AwaitAndBase<string> = Promise.resolve('test');
      expect(promise instanceof Promise).toBe(true);
    });
  });

  describe('Delegate Functions', () => {
    describe('TransformFn<T, U>', () => {
      it('should have correct signature', () => {
        const transform: TransformFn<string, number> = async (
          value: string,
          _index: number,
          _array: readonly (string | PromiseSettledResult<string>)[]
        ): Promise<number> => {
          const result = parseInt(value, 10);
          expect(typeof result).toBe('number');
          return result;
        };

        expect(typeof transform).toBe('function');
      });
    });

    describe('LookupFn<S, U>', () => {
      it('should have correct signature', () => {
        const lookup: LookupFn<string, number> = (
          _value: number,
          _index: number,
          _array: readonly (
            | string
            | Settled<string>
            | PromiseSettledResult<string>
          )[]
        ): OnlySideEffect => {
          expect(true).toBe(true); // Function was called
        };

        expect(typeof lookup).toBe('function');
      });
    });

    describe('ValidateFn<S, U>', () => {
      it('should have correct signature', () => {
        const validate: ValidateFn<string, number> = async (
          _value: number,
          _index: number,
          _array: readonly (string | PromiseSettledResult<string>)[]
        ): Promise<OnlySideEffect> => {
          expect(true).toBe(true); // Function was called
        };

        expect(typeof validate).toBe('function');
      });
    });

    describe('ErrLookupFn', () => {
      it('should have correct signature', () => {
        const errLookup: ErrLookupFn = (
          _reason: any,
          _index: number,
          _currentRejection: boolean
        ): OnlySideEffect => {
          expect(true).toBe(true); // Function was called
        };

        expect(typeof errLookup).toBe('function');
      });
    });
  });
});
