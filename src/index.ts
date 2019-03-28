// TypeRep
export type Repr<A> =
  | ArrayRep<A>
  | Dict<A>
  | PartialRep<A>
  | RecordRep<A>
  | Primitive<A>
  | Literal<A>
  | Union<A>
  | Tuple<A>
  | ClassRep<A>
  | Annot<A>
  ;


// Base class for instance methods
export class ReprBase<A> {
  readonly _A: A;
}

export class ArrayRep<A> extends ReprBase<A> {
  constructor(
    readonly _value: Repr<any>,
  ) { super(); }
}

export class Tuple<A> extends ReprBase<A> {
  constructor(
    readonly _tuple: Repr<any>[],
  ) { super(); }
}

export class Dict<A> extends ReprBase<A> {
  constructor(
    readonly _value: Repr<any>,
  ) { super(); }
}

export class RecordRep<A> extends ReprBase<A> {
  constructor(
    readonly _record: Record<string, Repr<any>>,
  ) { super(); }

  extend<F>(fields: { [K in keyof F]: Repr<F[K]> }): RecordRep<A & F> {
    return new RecordRep({ ...this._record, ...fields as any });
  }
  
  pick<K extends keyof A>(...keys: K[]): RecordRep<Pick<A, K>> {
    return new RecordRep(keys.reduce<any>((acc, k) => (acc[k] = this._record[k as string], acc), {}));
  }
  
  omit<K extends keyof A>(...keys: K[]): RecordRep<Omit<A, K>> {
    const description = Object.keys(this._record).reduce((acc, k) => (keys.indexOf(k as any) === -1 && (acc[k] = this._record[k]), acc), {});
    return new RecordRep(description);
  }  
}

export class PartialRep<A> extends ReprBase<A> {
  constructor(
    readonly _record: RecordRep<any>,
  ) { super(); }
}

export class Primitive<A> extends ReprBase<A> {
  constructor(
    readonly _type: 'boolean'|'string'|'number'|'any'|'unknown',
  ) { super(); }
}

export class Literal<A> extends ReprBase<A> {
  constructor(
    readonly _value: A,
  ) { super(); }
}

export class Union<A> extends ReprBase<A> {
  constructor(
    readonly _alternatives: Repr<A>[],
  ) { super(); }
}

export class ClassRep<A> extends ReprBase<A> {
  constructor(
    readonly _contructorArgs: Repr<A>[],
  ) { super(); }
}


export abstract class Annot<A> extends ReprBase<A> {
  abstract toRepresentable(): Repr<A>;
}


export function of<A extends Expr>(a: A): Literal<A> {
  return new Literal(a);
}


// Primitives
const anyRep = new Primitive<string>('any');
const unknownRep = new Primitive<string>('unknown');
const stringRep = new Primitive<string>('string');
const booleanRep = new Primitive<boolean>('boolean');
const numberRep = new Primitive<number>('number');
const nullRep = new Literal<null>(null);
const undefinedRep = new Literal<undefined>(undefined);


// Renamings
export { anyRep as any, stringRep as string, booleanRep as boolean, numberRep as number, nullRep as null, undefinedRep as undefined, unknownRep as unknown };


// TS union type
export function union<XS extends Repr<any>[]>(...array: XS): Union<XS[number]['_A']>;
export function union<XS extends Repr<any>[]>(array: XS): Union<XS[number]['_A']>;
export function union(): Union<any> {
  const xs = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
  return new Union(xs);
}


export function array<A>(decoder: Repr<A>): Repr<A[]> {
  return new ArrayRep(decoder);
}

export function record<T>(fields: { [K in keyof T]: Repr<T[K]> }): RecordRep<T> {
  return new RecordRep(fields);
}

export function dict<A>(decoder: Repr<A>): Repr<Record<string, A>> {
  return new Dict(decoder);
}

// @ts-ignore
export function tuple<T extends Repr<any>[]>(...reps: T): Tuple<{ [K in keyof T]: T[K]['_A'] }>;
export function tuple(...args): Repr<any> {
  return new Tuple(args);
}


export type Omit<T, U extends keyof T> = { [K in Exclude<keyof T, U>]: T[K] };
