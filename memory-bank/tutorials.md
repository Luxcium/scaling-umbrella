# Tutorials

## Working with Settled Types

The mapping-tools package provides a robust type system for handling asynchronous transformations with comprehensive error handling.

### Core Types

1. Basic Type Structure

```typescript
// Represents successful transformation results
interface SettledRight<T> {
  status: 'fulfilled';
  value: T;
  transformStep: number;
  index: number;
  currentRejection: null;
}

// Represents unsuccessful transformation results
interface SettledLeft {
  status: 'rejected';
  reason: any;
  currentRejection: true | false | undefined;
  transformStep: number;
  index: number;
}
```

2. Input Type Flexibility

```typescript
// Base type allows multiple input formats
type Base<TBase> =
  | TBase                          // Raw value
  | Settled<TBase>                // Previous transformation result
  | PromiseSettledResult<TBase>   // Promise.allSettled result
  | SettledRight<TBase>           // Successful result
  | PromiseFulfilledResult<TBase> // Promise success
  | SettledLeft                   // Failed result
  | PromiseRejectedResult;        // Promise failure
```

### Delegate Functions

1. Transform Function

```typescript
// Transforms input value to output value
const transform: TransformFn<string, number> = async (
  value: string,
  index: number,
  array: readonly string[]
): Promise<number> => {
  return parseInt(value, 10);
};
```

2. Lookup Function

```typescript
// Side-effect only function for successful transformations
const lookup: LookupFn<string, number> = (
  value: number,
  index: number,
  array: readonly string[]
): void => {
  console.log(`Processed value at index ${index}: ${value}`);
};
```

3. Validate Function

```typescript
// Validation with error throwing
const validate: ValidateFn<string, number> = async (
  value: number,
  index: number,
  array: readonly string[]
): Promise<void> => {
  if (isNaN(value)) {
    throw new Error(`Invalid number at index ${index}`);
  }
};
```

4. Error Lookup Function

```typescript
// Handle errors during transformation
const errLookup: ErrLookupFn = (
  reason: any,
  index: number,
  currentRejection: boolean
): void => {
  if (currentRejection) {
    console.error(`New error at index ${index}:`, reason);
  } else {
    console.warn(`Previous error at index ${index}:`, reason);
  }
};
```

### Usage Examples

1. Basic Transformation

```typescript
const collection = ['1', '2', '3'];

// Transform strings to numbers
const results = await serialMapping(
  collection,
  async (value) => parseInt(value, 10)
);

// Results are type-safe and include metadata
results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log(`Success: ${result.value}`);
  } else {
    console.error(`Error: ${result.reason}`);
  }
});
```

2. With Error Handling

```typescript
const collection = ['1', 'not-a-number', '3'];

const results = await serialMapping(
  collection,
  // Transform function
  async (value) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) throw new Error(`Invalid number: ${value}`);
    return num;
  },
  // Lookup function
  (value) => console.log(`Processed: ${value}`),
  // Validate function
  async (value) => {
    if (value < 0) throw new Error('Negative numbers not allowed');
  },
  // Error lookup function
  (reason, index, current) => console.error(`Error at ${index}:`, reason)
);
```

### Type Safety

1. Generic Type Constraints

```typescript
// Input and output types are tracked
async function processData<T, R>(
  data: T[],
  transform: TransformFn<T, R>
): Promise<Settled<R>[]> {
  return serialMapping(data, transform);
}

// Type inference works
const numbers = await processData(
  ['1', '2', '3'],
  async (value) => parseInt(value, 10)
);
// numbers: Settled<number>[]
```

2. Error Type Safety

```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error type is preserved
const results = await serialMapping(
  collection,
  async (value) => {
    if (!isValid(value)) {
      throw new ValidationError('Invalid value');
    }
    return process(value);
  }
);
```

### Best Practices

1. Always handle both success and error cases
2. Use type guards to narrow types safely
3. Keep transform functions pure when possible
4. Use lookup functions for side effects
5. Validate early and fail fast
6. Provide meaningful error messages
7. Use appropriate mapping function for your use case

### Performance Considerations

1. Use `parallelMapping` for independent operations
2. Use `serialMapping` for dependent operations
3. Use `generateMapping` for lazy evaluation
4. Consider memory usage with large collections
5. Handle errors at appropriate levels

### Next Steps

- Explore advanced mapping patterns
- Implement custom error handling
- Create reusable transformations
- Add comprehensive logging
- Optimize performance
