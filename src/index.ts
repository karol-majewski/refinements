export type Refinement<T, U extends T> = (candidate: T) => candidate is U;

export namespace Refinement {
  class Hit<T> {
    constructor(readonly value: T) {}
  }

  class Miss {
    readonly brand = 'none'
  }

  type Result<T> = Hit<T> | Miss;

  export function hit<T>(value: T) {
    return new Hit(value);
  }

  export const miss = new Miss();

  /**
   * Creates a type-safe refinement.
   *
   *  @example
   *
   *   ```ts
   *   const isString: Refinement<unknown, string> = Refinement.create(
   *     candidate =>
   *       typeof candidate === 'string'
   *         ? Refinement.hit(candidate)
   *         : Refinement.miss
   *   )
   *   ```
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
 *     compose(
 *       isError,
 *       isReferenceError
 *     )
 *   ```
 */
export function compose<T, U extends T, V extends U, W extends V>(
  ...refinements: [Refinement<T, U>, Refinement<U, V>, Refinement<V, W>]
): Refinement<T, W>;
export function compose<T, U extends T, V extends U>(
  ...refinements: [Refinement<T, U>, Refinement<U, V>]
): Refinement<T, V>;
export function compose<T, U extends T>(
  ...refinements: [Refinement<T, U>]
): Refinement<T, U>;
export function compose<T>(...refinements: Refinement<any, any>[]): any {
  return (candidate: T) =>
    refinements.reduce(
      (verdict, refinement) => verdict && refinement(candidate),
      true
    );
}

/**
 * Combines type guards.
 *
 * @example
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
 *   class Cat {}
 *   class Dog {}
 *
 *   type Pet = Cat | Dog;
 *
 *   declare function isCat(pet: Pet): pet is Cat;
 *
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
