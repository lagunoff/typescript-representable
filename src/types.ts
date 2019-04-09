/**
 * Constraint type for better type inference
 * 
 *   function id<A>(a: A): A;
 *   function idL<A extends Lit>(a: A): A;
 *   
 *   const a01 = id('string literal'); // typeof a01 ~ string
 *   const a02 = idL('string literal'); // typeof a02 ~ "string literal" 
 */
export type Lit = boolean|null|undefined|number|string|{}|any[]|[any,any]|[any,any,any];


/**
 * Helper for totality checking
 * 
 *   type Language = 'haskell'|'purescript'|'javascript'|'prolog';
 *   type Paradigm = 'imperative'|'declarative'|'logic';

 *   function foo(lang: Language): Paradigm {
 *     if (lang === 'haskell') return 'declarative';
 *     if (lang === 'purescript') return 'declarative';
 *     if (lang === 'javascript') return 'imperative';
 *     if (lang === 'prolog') return 'logic';
 *     return absurd(lang); // Typechecks if typeof lang ~ never
 *   }
 */
export function absurd(x: never): any {
  throw new Error('absurd: unreachable code');
}
