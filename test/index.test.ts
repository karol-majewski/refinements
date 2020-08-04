import Refinement, { not, compose, either } from '../src';

describe('creating refinements', () => {
  class Cat {
    meow(): void {}
  }

  class Dog {
    bark(): void {}
  }

  type Pet = Cat | Dog;

  const cat = new Cat();
  const dog = new Dog();

  const isCat: Refinement<Pet, Cat> = Refinement.create(pet =>
    pet instanceof Cat ? Refinement.hit(pet) : Refinement.miss
  );

  it('returns correct type guards', () => {
    expect(isCat(cat)).toBe(true);
    expect(isCat(dog)).toBe(false);
  });

  it('requires the callback to return a Result', () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isWindow: Refinement<unknown, Window> = Refinement.create(
      // @ts-expect-error
      candidate => true
    );
  });
});

describe('negating refinemenets', () => {
  type Standard = 'inherit' | 'initial' | 'revert' | 'unset';
  type Prefixed = '-moz-initial';

  type Property = Standard | Prefixed;

  const isPrefixed = Refinement.create((property: Property) =>
    property === '-moz-initial' ? Refinement.hit(property) : Refinement.miss
  );

  const isStandard = not(isPrefixed);

  it('negates correctly', () => {
    expect(isPrefixed('revert')).toBe(false);
    expect(isStandard('revert')).toBe(true);

    expect(isPrefixed('-moz-initial')).toBe(true);
    expect(isStandard('-moz-initial')).toBe(false);
  });
});

abstract class Fruit {
  constructor(readonly species: string) {
    this.species = species;
  }
}

class Orange extends Fruit {
  constructor() {
    super('orange');
  }
}

class Mango extends Fruit {
  constructor() {
    super('mango');
  }
}

class Banana extends Fruit {
  constructor() {
    super('banana');
  }
}

abstract class Vegetable {}

type Merchendise = Fruit | Vegetable;

const isFruit: Refinement<Merchendise, Fruit> = Refinement.create(merchendise =>
  merchendise instanceof Fruit ? Refinement.hit(merchendise) : Refinement.miss
);

const isOrange: Refinement<Fruit, Orange> = Refinement.create(fruit =>
  fruit instanceof Orange ? Refinement.hit(fruit) : Refinement.miss
);

const isMango: Refinement<Fruit, Mango> = Refinement.create(fruit =>
  fruit instanceof Mango ? Refinement.hit(fruit) : Refinement.miss
);

describe('compose', () => {
  it('requires at least one argument', () => {
    const clone = compose(isMango);
    const mango = new Mango();

    expect(clone(mango)).toEqual(isMango(mango));
  });

  it('accepts two type guards', () => {
    const mango = new Mango();

    expect(compose(isFruit, isMango)(mango)).toEqual(isMango(mango));
  });

  it('composes in the correct order', () => {
    const banana = new Banana();

    expect(isFruit(banana)).toBe(true);
    expect(isMango(banana)).toBe(false);
    expect(compose(isFruit, isMango)(banana)).toBe(false);
  });
});

describe('either', () => {
  it('combines type guards', () => {
    const isJuicy: Refinement<Fruit, Orange | Mango> = either(
      isOrange,
      isMango
    );

    const fruits: Fruit[] = [new Orange(), new Mango()];

    expect(fruits.filter(isJuicy)).toEqual(fruits);
  });
});
