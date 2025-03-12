# Product Context

## User Workflows

1. Type-First Development

   ```mermaid
   flowchart TD
     A[Define Types] --> B[Write Tests]
     B --> C[Implement Feature]
     C --> D[Validate Types]
     D --> E[Document Changes]
     E --> F[Update Patterns]
   ```

2. Testing Workflow (TDD)

   ```mermaid
   flowchart TD
     A[Write Test] --> B[Use @jest/globals]
     B --> C[Run Tests]
     C --> D{Pass?}
     D -->|No| E[Implement Code]
     E --> F{Pre-commit Hook}
     F -->|Fail| C
     F -->|Pass| G[Refactor]
     G --> C
     D -->|Yes| G
   ```

3. Documentation Flow

   ```mermaid
   flowchart TD
     A[Code Changes] --> B[Update Types]
     B --> C[Update Tests]
     C --> D[Update Memory Bank]
     D --> E[Generate Docs]
     E --> F[Update Patterns]
   ```

## Expanded Examples

1. Type-First Development Example

   ```typescript
   // Define collection transformation types
   interface TransformConfig<T, R> {
     transform: TransformFn<T, R>;
     validate?: ValidateFn<T, R>;
     lookup?: LookupFn<T, R>;
     errLookup?: ErrLookupFn;
   }

   // Function to process a collection
   async function processItems<T, R>(
     items: T[],
     config: TransformConfig<T, R>
   ): Promise<Settled<R>[]> {
     return serialMapping(
       items,
       config.transform,
       config.lookup,
       config.validate,
       config.errLookup
     );
   }
   ```

2. Testing Workflow Example

   ```typescript
   import { describe, expect, it } from '@jest/globals';

   describe('Collection Processing', () => {
     it('should transform valid items', async () => {
       const items = ['1', '2', '3'];
       const config: TransformConfig<string, number> = {
         transform: async (value) => parseInt(value, 10)
       };

       const results = await processItems(items, config);
       
       results.forEach(result => {
         expect(result.status).toBe('fulfilled');
         if (result.status === 'fulfilled') {
           expect(typeof result.value).toBe('number');
         }
       });
     });
   });
   ```

3. Documentation Flow Example

   ```markdown
   # Collection Processing

   ## Overview
   This module handles type-safe collection transformations with comprehensive error handling.

   ## Design Decisions
   * Uses Settled types for transformation results
   * Provides delegate functions for customization
   * Supports both sync and async operations

   ## Usage Examples
   ```typescript
   // Transform string array to numbers with validation
   const config: TransformConfig<string, number> = {
     transform: async (value) => parseInt(value, 10),
     validate: async (num) => {
       if (num < 0) throw new Error('Negative numbers not allowed');
     },
     lookup: (num) => console.log(`Processed: ${num}`),
     errLookup: (error, index) => console.error(`Error at ${index}:`, error)
   };

   const results = await processItems(['1', '2', '3'], config);
   ```

   ```text
   ```

---

This document should be updated when there are changes to product direction, user needs, or key features.
