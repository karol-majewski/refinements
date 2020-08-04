<h1 align="center">Refinements</h1>

<p align="center">A type-safe alternative to standard <a href="https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards">user-defined type guards</a>. </p>

<p align="center">
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/npm/l/refinements.svg?logo=License&style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/refinements">
    <img alt="Latest Release" src="https://img.shields.io/npm/v/refinements.svg?label=npm%40latest&style=flat-square">
  </a>
  <a href="CONTRIBUTING.md">
    <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-green.svg?style=flat-square">
  </a>
</p>

## Installation

```bash
npm install refinements
```

```bash
yarn add refinements
```

## Usage

<!-- prettier-ignore-start -->

```typescript
import Refinement from 'refinements';

class Mango {}
class Orange {}

type Fruit = Mango | Orange;

const isMango: Refinement<Fruit, Mango> = Refinement.create(
  fruit =>
    fruit instanceof Mango
      ? Refinement.hit(fruit)
      : Refinement.miss
);

const fruits: Fruit[] = [new Mango(), new Orange()];
const mangos: Mango[] = fruits.filter(isMango);
```

<!-- prettier-ignore-end -->

## Why?

By default, user-defined type guard are not type-checked. This leads to silly errors.

```typescript
const isString = (candidate: unknown): candidate is string =>
  typeof candidate === 'number';
```

TypeScript is happy to accept such buggy code.

The `create` function exposed by this library _is_ type-checked. Let's see how it helps create bulletproof type-guards by rewriting the original implementation.

<!-- prettier-ignore-start -->

```typescript
import Refinement from 'refinements';

const isString: Refinement<unknown, string> = Refinement.create(
  candidate =>
    typeof candidate === 'string'
      ? Refinement.hit(candidate)
      : Refinement.miss
);
```
<!-- prettier-ignore-end -->

If we tried to replace, say, `typeof candidate === 'string'` with the incorrect `typeof candidate === 'number'`, we would get a compile-time error.

Learn more about how it works:

[![](https://img.youtube.com/vi/StyKp5dgN_Y/0.jpg)](http://www.youtube.com/watch?v=StyKp5dgN_Y 'Karol Majewski — “Who Guards the Type Guards?”')

## Examples

### Composition

<!-- prettier-ignore-start -->

Let's assume the following domain.

```typescript
abstract class Fruit {
  readonly species: string;
}

class Orange extends Fruit {
  readonly species: 'orange';
}

class Mango extends Fruit {
  readonly species: 'mango';
}

abstract class Vegetable {
  nutritious: boolean;
}

type Merchendise = Fruit | Vegetable;
```

To navigate the hierarchy of our domain, we can create a refinement for every union that occurs in the domain.

```typescript
import Refinement from 'refinements';

const isFruit: Refinement<Merchendise, Fruit> = Refinement.create(
  merchendise =>
    merchendise instanceof Fruit
      ? Refinement.hit(merchendise)
      : Refinement.miss
);

const isOrange: Refinement<Fruit, Orange> = Refinement.create(
  fruit =>
    fruit instanceof Orange
      ? Refinement.hit(fruit)
      : Refinement.miss
);

const isMango: Refinement<Fruit, Mango> = Refinement.create(
  fruit =>
    fruit instanceof Mango
      ? Refinement.hit(fruit)
      : Refinement.miss
);
```

Such refinements can be composed together.

```typescript
import { either, compose } from 'refinements';

const isJuicy =
  compose(
    isFruit,
    either(isOrange, isMango)
);
```

<!-- prettier-ignore-end -->

### Negation

<!-- prettier-ignore-start -->

```typescript
import Refinement, { not } from 'refinements';

type Standard = 'inherit' | 'initial' | 'revert' | 'unset';
type Prefixed = '-moz-initial';

type Property = Standard | Prefixed;

// We can cherry-pick the one that stands out
const isPrefixed = Refinement.create(
  (property: Property) =>
    property === '-moz-initial'
      ? Refinement.hit(property)
      : Refinement.miss
);

// And get the rest by negating the first one
const isStandard = not(isPrefixed);
```

<!-- prettier-ignore-end -->

> **⚠️ Warning!** This is an experimental feature. For this to work, the union members have to be mutually exclusive. If you do something like this:
>
> ```typescript
> declare function isString(candidate: any): candidate is string;
>
> const isNotString = not(isString);
> ```
>
> It will work, but the inferred type will be `(candidate: any) => candidate is any`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Inspiration

- [`getRefinement`](https://github.com/gcanti/fp-ts/blob/d87f622887dbe7239b6cbab50d287ee6289b82c9/src/Option.ts#L1120-L1139) from [`fp-ts`](https://github.com/gcanti/fp-ts/)

## License

[MIT](https://choosealicense.com/licenses/mit/)
