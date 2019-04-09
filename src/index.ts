import { Lit } from './types';


// Runtime representation of typescript types
export type Type<A> =
  | ArrayType<A>
  | DictType<A>
  | PartialType<A>
  | RecordType<A>
  | PrimitiveType<A>
  | LiteralType<A>
  | UnionType<A>
  | TupleType<A>
  | ClassType<A>
  | Annot<A>
;


// Instance methods
export class Base<A> {
  readonly _A: A;

  with<B>(this: Type<A>, fn: (a: Type<A>) => B): B {
    return fn(this);
  }
}

export class ArrayType<A> extends Base<A> {
  constructor(
    readonly _value: Type<any>,
  ) { super(); }
}

export class TupleType<A> extends Base<A> {
  constructor(
    readonly _tuple: Type<any>[],
  ) { super(); }
}

export class DictType<A> extends Base<A> {
  constructor(
    readonly _value: Type<any>,
  ) { super(); }
}

export class RecordType<A> extends Base<A> {
  constructor(
    readonly _record: Record<string, Type<any>>,
  ) { super(); }

  extend<F>(fields: { [K in keyof F]: Type<F[K]> }): RecordType<A & F> {
    return new RecordType({ ...this._record, ...fields as any });
  }
  
  pick<K extends keyof A>(...keys: K[]): RecordType<Pick<A, K>> {
    return new RecordType(keys.reduce<any>((acc, k) => (acc[k] = this._record[k as string], acc), {}));
  }
  
  omit<K extends keyof A>(...keys: K[]): RecordType<Omit<A, K>> {
    const description = Object.keys(this._record).reduce((acc, k) => (keys.indexOf(k as any) === -1 && (acc[k] = this._record[k]), acc), {});
    return new RecordType(description);
  }  
}

export class PartialType<A> extends Base<A> {
  constructor(
    readonly _record: RecordType<any>,
  ) { super(); }
}

export class PrimitiveType<A> extends Base<A> {
  constructor(
    readonly _type: 'boolean'|'string'|'number'|'any'|'unknown',
  ) { super(); }
}

export class LiteralType<A> extends Base<A> {
  constructor(
    readonly _value: A,
  ) { super(); }
}

export class UnionType<A> extends Base<A> {
  constructor(
    readonly _alternatives: Type<A>[],
  ) { super(); }
}

export class ClassType<A> extends Base<A> {
  constructor(
    readonly _class: Function,
    readonly _contructorArgs: Type<A>[],
  ) { super(); }
}


export abstract class Annot<A> extends Base<A> {
  abstract toRepresentable(): Type<A>;
}


export function of<A extends Lit>(a: A): LiteralType<A> {
  return new LiteralType(a);
}

// Primitives
const anyType = new PrimitiveType<string>('any');
const unknownType = new PrimitiveType<string>('unknown');
const stringType = new PrimitiveType<string>('string');
const booleanType = new PrimitiveType<boolean>('boolean');
const numberType = new PrimitiveType<number>('number');
const nullType = new LiteralType<null>(null);
const undefinedType = new LiteralType<undefined>(undefined);


// Renamings
export { anyType as any, stringType as string, booleanType as boolean, numberType as number, nullType as null, undefinedType as undefined, unknownType as unknown };


// Union type
export function oneOf<XS extends Type<any>[]>(...array: XS): UnionType<XS[number]['_A']>;
export function oneOf<XS extends Type<any>[]>(array: XS): UnionType<XS[number]['_A']>;
export function oneOf(): UnionType<any> {
  const xs = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
  return new UnionType(xs);
}


export function array<A>(decoder: Type<A>): ArrayType<A[]> {
  return new ArrayType(decoder);
}

export function record<T>(fields: { [K in keyof T]: Type<T[K]> }): RecordType<T> {
  return new RecordType(fields);
}

export function dict<A>(decoder: Type<A>): DictType<Record<string, A>> {
  return new DictType(decoder);
}

// @ts-ignore
export function tuple<T extends Type<any>[]>(...types: T): TupleType<{ [K in keyof T]: T[K]['_A'] }> {
  return new TupleType(types);
}


export type Omit<T, U extends keyof T> = { [K in Exclude<keyof T, U>]: T[K] };
