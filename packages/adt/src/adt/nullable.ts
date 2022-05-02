import { pipeable2, pipeable3 } from '../internal/pipeable'

//#region Types

export type Nullable<A> = A | null | undefined

//#endregion

//#region Guards

export const isNonNullable = <A>(
  nullable: Nullable<A>
): nullable is NonNullable<A> => nullable !== null && nullable !== undefined

export const isNullOrUndefined = <A>(
  nullable: Nullable<A>
): nullable is null | undefined => nullable === null || nullable === undefined

interface Exists {
  <A, B extends A>(
    nullable: Nullable<A>,
    refinement: (a: A) => a is B
  ): nullable is B
  <A, B extends A>(refinement: (a: A) => a is B): (
    nullable: Nullable<A>
  ) => nullable is B

  <A>(nullable: Nullable<A>, predicate: (a: A) => boolean): nullable is A
  <A>(predicate: (a: A) => boolean): (nullable: Nullable<A>) => nullable is A
}
const _exists = <A, B extends A>(
  nullable: Nullable<A>,
  refinement: (a: A) => a is B
): nullable is B => isNonNullable(nullable) && refinement(nullable)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exists: Exists = pipeable2(_exists as any) as any

//#endregion

//#region Transformers

interface Filter {
  <A, B extends A>(
    nullable: Nullable<A>,
    refinement: (a: A) => a is B
  ): Nullable<B>
  <A, B extends A>(refinement: (a: A) => a is B): (
    nullable: Nullable<A>
  ) => Nullable<B>

  <A>(nullable: Nullable<A>, predicate: (a: A) => boolean): Nullable<A>
  <A>(predicate: (a: A) => boolean): (nullable: Nullable<A>) => Nullable<A>
}
const _filter = <A, B extends A>(
  nullable: Nullable<A>,
  refinement: (a: A) => a is B
): Nullable<B> =>
  isNonNullable(nullable) && refinement(nullable) ? nullable : undefined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filter: Filter = pipeable2(_filter as any)

interface Map {
  <A, B>(nullable: Nullable<A>, f: (a: A) => B): Nullable<B>
  <A, B>(f: (a: A) => B): (nullable: Nullable<A>) => Nullable<B>
}
const _map = <A, B>(nullable: Nullable<A>, f: (a: A) => B): Nullable<B> =>
  isNonNullable(nullable) ? f(nullable) : undefined
export const map: Map = pipeable2(_map)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const combineTuple = <AS extends [Nullable<any>, ...Nullable<any>[]]>(
  ...ns: AS
): Nullable<{ [K in keyof AS]: NonNullable<AS[K]> }> =>
  ns.every(isNonNullable) ? ns : undefined

//#endregion

//#region Destructors

interface GetOrElse {
  <A>(nullable: Nullable<A>, ifAbsent: () => A): A
  <A>(ifAbsent: () => A): (nullable: Nullable<A>) => A
}
const _getOrElse = <A>(nullable: Nullable<A>, ifAbsent: () => A): A =>
  isNonNullable(nullable) ? nullable : ifAbsent()
export const getOrElse: GetOrElse = pipeable2(_getOrElse)

interface Match {
  <A, B>(nullable: Nullable<A>, ifPresent: (a: A) => B, ifAbsent: () => B): B
  <A, B>(ifPresent: (a: A) => B, ifAbsent: () => B): (
    nullable: Nullable<A>
  ) => B
}
const _match = <A, B>(
  nullable: Nullable<A>,
  ifPresent: (a: A) => B,
  ifAbsent: () => B
): B => (isNonNullable(nullable) ? ifPresent(nullable) : ifAbsent())
export const match: Match = pipeable3(_match)

export const toUndefined = <A>(nullable: Nullable<A>): A | undefined =>
  nullable ?? undefined

export const toNull = <A>(nullable: Nullable<A>): A | null => nullable ?? null

//#endregion
