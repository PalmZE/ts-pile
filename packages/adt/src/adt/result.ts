import { pipeable2, pipeable3 } from '../internal/pipeable'

//#region Types

export type Ok<A> = { kind: 'Ok'; value: A }

export type Error<E> = { kind: 'Error'; error: E }

export type Result<E, A> = Error<E> | Ok<A>

//#endregion

//#region Constructors

export const ok = <E, A>(value: A): Result<E, A> => ({ kind: 'Ok', value })
export const error = <E, A>(error: E): Result<E, A> => ({
  kind: 'Error',
  error,
})

//#endregion

//#region Guards

export const isOk = <A>(result: Result<unknown, A>): result is Ok<A> =>
  result.kind === 'Ok'

export const isError = <E>(result: Result<E, unknown>): result is Error<E> =>
  result.kind === 'Error'

interface Exists {
  <E, A, B extends A>(
    result: Result<E, A>,
    refinement: (a: A) => a is B
  ): result is Ok<B>
  <E, A, B extends A>(refinement: (a: A) => a is B): (
    result: Result<E, A>
  ) => result is Ok<B>

  <E, A>(result: Result<E, A>, predicate: (a: A) => boolean): result is Ok<A>
  <E, A>(predicate: (a: A) => boolean): (
    result: Result<E, A>
  ) => result is Ok<A>
}
const _exists = <E, A, B extends A>(
  result: Result<E, A>,
  refinement: (a: A) => a is B
): result is Ok<B> => result.kind === 'Ok' && refinement(result.value)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exists: Exists = pipeable2(_exists as any) as any

//#endregion

//#region Transformers

interface Map {
  <E, A, B>(result: Result<E, A>, f: (a: A) => B): Result<E, B>
  <E, A, B>(f: (a: A) => B): (result: Result<E, A>) => Result<E, B>
}
const _map = <E, A, B>(result: Result<E, A>, f: (a: A) => B): Result<E, B> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.kind === 'Ok' ? ok(f(result.value)) : (result as any)
export const map: Map = pipeable2(_map)

interface FlatMap {
  <E, E2, A, B>(result: Result<E, A>, f: (a: A) => Result<E2, B>): Result<
    E | E2,
    B
  >
  <E, E2, A, B>(f: (a: A) => Result<E2, B>): (
    result: Result<E, A>
  ) => Result<E | E2, B>
}
const _flatMap = <E, E2, A, B>(
  result: Result<E, A>,
  f: (a: A) => Result<E2, B>
): Result<E | E2, B> => (result.kind === 'Ok' ? f(result.value) : result)
export const flatMap: FlatMap = pipeable2(_flatMap)

interface MapError {
  <E, A, E2>(result: Result<E, A>, f: (error: E) => E2): Result<E2, A>
  <E, A, E2>(f: (error: E) => E2): (result: Result<E, A>) => Result<E2, A>
}
const _mapError = <E, A, E2>(
  result: Result<E, A>,
  f: (error: E) => E2
): Result<E2, A> => (result.kind === 'Error' ? error(f(result.error)) : result)
export const mapError: MapError = pipeable2(_mapError)

interface Filter {
  <E, E2, A, B extends A>(
    result: Result<E, A>,
    refinement: (a: A) => a is B,
    ifFiltered: (a: A) => E2
  ): Result<E | E2, B>
  <E, E2, A, B extends A>(
    refinement: (a: A) => a is B,
    ifFiltered: (a: A) => E2
  ): (result: Result<E, A>) => Result<E | E2, B>

  <E, E2, A>(
    result: Result<E, A>,
    predicate: (a: A) => boolean,
    ifFiltered: (a: A) => E2
  ): Result<E | E2, A>
  <E, E2, A>(predicate: (a: A) => boolean, ifFiltered: (a: A) => E2): (
    result: Result<E, A>
  ) => Result<E | E2, A>
}
const _filter = <E, E2, A, B extends A>(
  result: Result<E, A>,
  refinement: (a: A) => a is B,
  ifFiltered: (a: A) => E2
): Result<E | E2, B> => {
  if (result.kind === 'Ok') {
    return refinement(result.value)
      ? ok(result.value)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error(ifFiltered(result.value)) as any)
  }

  return result
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filter: Filter = pipeable3(_filter as any) as any

export const combineTuple = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AS extends [Result<any, any>, ...Result<any, any>[]]
>(
  ...ns: AS
): Result<
  unknown,
  { [K in keyof AS]: AS[K] extends Ok<infer U> ? U : never }
> =>
  ns.every(isOk)
    ? ok(ns.map((n) => (n as Ok<unknown>).value))
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error(undefined) as any)

//#endregion

//#region Destructors

export const toUndefined = <A>(result: Result<unknown, A>): A | undefined =>
  result.kind === 'Ok' ? result.value : undefined

export const toNull = <A>(result: Result<unknown, A>): A | null =>
  result.kind === 'Ok' ? result.value : null

interface GetOrElse {
  <A>(result: Result<unknown, A>, a: () => A): A
  <A>(a: () => A): (result: Result<unknown, A>) => A
}
const _getOrElse = <A>(result: Result<unknown, A>, a: () => A): A =>
  result.kind === 'Ok' ? result.value : a()
export const getOrElse: GetOrElse = pipeable2(_getOrElse)

interface Match {
  <E, A, B>(result: Result<E, A>, ifOk: (a: A) => B, ifError: (e: E) => B): B
  <E, A, B>(ifOk: (a: A) => B, ifError: (e: E) => B): (
    result: Result<E, A>
  ) => B
}
const _match = <E, A, B>(
  result: Result<E, A>,
  ifOk: (a: A) => B,
  ifError: (e: E) => B
): B => (result.kind === 'Ok' ? ifOk(result.value) : ifError(result.error))
export const match: Match = pipeable3(_match)

//#endregion
