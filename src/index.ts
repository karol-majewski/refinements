export type Refinement<T, U extends T> = (candidate: T) => candidate is U;

export namespace Refinement {
  class Hit<T> {
    constructor(readonly value: T) {}
  }

  class Miss {}

  type Result<T> = Hit<T> | Miss;

  export function hit<T>(value: T) {
    return new Hit(value);
  }

  export const miss = new Miss();

  /**
   * Returns a `Refinement` (i.e. a custom type guard) from a `Option` returning function.
   * This function ensures that a custom type guard definition is type-safe.
   *
   *   ```ts
   *   import Refinement from 'refinements'
   *
   *   type A = { type: 'A' }
   *   type B = { type: 'B' }
   *   type C = A | B
   *
   *   const isA = (c: C): c is A => c.type === 'B' // <= typo but typescript doesn't complain
   *   const isA = getRefinement<C, A>(c => (c.type === 'B' ? some(c) : none)) // static error: Type '"B"' is not assignable to type '"A"'
   *   ```
   *
   * @since 2.0.0
   */
  export function create<T, U extends T>(
    refine: (candidate: T) => Result<U>
  ): (candidate: T) => candidate is U {
    return (candidate): candidate is U => refine(candidate) instanceof Hit;
  }
}

/**
 * Runs type guards in sequence.
 *
 * @example
 *
 *   ```ts
 *   declare function isError(candidate: unknown): candidate is Error;
 *   declare function isReferenceError(candidate: Error): candidate is ReferenceError;
 *
 *   const isProgrammerError =
 *     pipe(
 *       isError,
 *       isReferenceError
 *     )
 *   ```
 */
export function pipe<T, U extends T, V extends U, W extends V>(
  ...refinements: [Refinement<T, U>, Refinement<U, V>, Refinement<V, W>]
): Refinement<T, W>;
export function pipe<T, U extends T, V extends U>(
  ...refinements: [Refinement<T, U>, Refinement<U, V>]
): Refinement<T, V>;
export function pipe<T, U extends T>(
  ...refinements: [Refinement<T, U>]
): Refinement<T, U>;
export function pipe<T>(...refinements: Refinement<any, any>[]): any {
  return (candidate: T) =>
    refinements.reduce(
      (verdict, refinement) => verdict && refinement(candidate),
      true
    );
}

/**
 * Combines type guards.
 *
 *   ```ts
 *   declare function isString(candidate: unknown): candidate is string;
 *   declare function isNumber(candidate: unknown): candidate is number;
 *
 *   const isPrimitive = either(isString, isNumber);
 *   ```
 */
export function either<T, U extends T, V extends T, W extends T>(
  ...refinements: [Refinement<T, U>, Refinement<T, V>, Refinement<T, W>]
): Refinement<T, U | V | W>;
export function either<T, U extends T, V extends T>(
  ...refinements: [Refinement<T, U>, Refinement<T, V>]
): Refinement<T, U | V>;
export function either<T>(...refinements: Refinement<any, any>[]): any {
  return (candidate: T) =>
    refinements.reduce(
      (verdict, refinement) => verdict || refinement(candidate),
      false
    );
}

/**
 * Negates a type guard.
 *
 * @example
 *
 *   ```ts
 *   declare function isCat(pet: Cat | Dog): pet is Cat;
 *   const isDog = not(isCat);
 *   ```
 *
 * @remarks
 *
 *   T must be a well-defined union. It cannot be `any`, `unknown` or `{}`.
 *
 * @experimental
 */
export function not<T, U extends T>(
  refinement: Refinement<T, U>
): Refinement<T, Exclude<T, U>> {
  return (candidate): candidate is Exclude<T, U> => !refinement(candidate);
}

export default Refinement;
