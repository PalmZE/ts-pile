import { pipeable2, pipeable3 } from '../internal/pipeable'

//#region Types

export type Ok<A> = { kind: 'Ok'; value: A }
export type Error<E> = { kind: 'Error'; error: E }
export type Initial = { kind: 'Initial' }
export type Loading = { kind: 'Loading' }
export type AsyncResult<E, A> = Initial | Loading | Error<E> | Ok<A>

//#endregion

//#region Constructors

export const initial: Initial = { kind: 'Initial' }
export const loading: Loading = { kind: 'Loading' }
export const ok = <E, A>(value: A): AsyncResult<E, A> => ({
  kind: 'Ok',
  value,
})
export const error = <E, A>(error: E): AsyncResult<E, A> => ({
  kind: 'Error',
  error,
})

//#endregion

//#region Guards

export const isOk = <A>(result: AsyncResult<unknown, A>): result is Ok<A> =>
  result.kind === 'Ok'
export const isError = <E>(
  result: AsyncResult<E, unknown>
): result is Error<E> => result.kind === 'Error'
export const isInitial = <E, A>(result: AsyncResult<E, A>): result is Initial =>
  result.kind === 'Initial'
export const isLoading = <E, A>(result: AsyncResult<E, A>): result is Loading =>
  result.kind === 'Loading'

interface Exists {
  <E, A, B extends A>(
    result: AsyncResult<E, A>,
    refinement: (a: A) => a is B
  ): result is Ok<B>
  <E, A, B extends A>(refinement: (a: A) => a is B): (
    result: AsyncResult<E, A>
  ) => result is Ok<B>

  <E, A>(
    result: AsyncResult<E, A>,
    predicate: (a: A) => boolean
  ): result is Ok<A>
  <E, A>(predicate: (a: A) => boolean): (
    result: AsyncResult<E, A>
  ) => result is Ok<A>
}
const _exists = <E, A, B extends A>(
  result: AsyncResult<E, A>,
  refinement: (a: A) => a is B
): result is Ok<B> => result.kind === 'Ok' && refinement(result.value)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exists: Exists = pipeable2(_exists as any) as any

//#endregion

//#region Transformers

interface Map {
  <E, A, B>(result: AsyncResult<E, A>, f: (a: A) => B): AsyncResult<E, B>
  <E, A, B>(f: (a: A) => B): (result: AsyncResult<E, A>) => AsyncResult<E, B>
}
const _map = <E, A, B>(
  result: AsyncResult<E, A>,
  f: (a: A) => B
): AsyncResult<E, B> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.kind === 'Ok' ? ok(f(result.value)) : (result as any)
export const map: Map = pipeable2(_map)

interface FlatMap {
  <E, E2, A, B>(
    result: AsyncResult<E, A>,
    f: (a: A) => AsyncResult<E2, B>
  ): AsyncResult<E | E2, B>
  <E, E2, A, B>(f: (a: A) => AsyncResult<E2, B>): (
    result: AsyncResult<E, A>
  ) => AsyncResult<E | E2, B>
}
const _flatMap = <E, E2, A, B>(
  result: AsyncResult<E, A>,
  f: (a: A) => AsyncResult<E2, B>
): AsyncResult<E | E2, B> => (result.kind === 'Ok' ? f(result.value) : result)
export const flatMap: FlatMap = pipeable2(_flatMap)

interface MapError {
  <E, A, E2>(result: AsyncResult<E, A>, f: (error: E) => E2): AsyncResult<E2, A>
  <E, A, E2>(f: (error: E) => E2): (
    result: AsyncResult<E, A>
  ) => AsyncResult<E2, A>
}
const _mapError = <E, A, E2>(
  result: AsyncResult<E, A>,
  f: (error: E) => E2
): AsyncResult<E2, A> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.kind === 'Error' ? error(f(result.error)) : (result as any)
export const mapError: MapError = pipeable2(_mapError)

interface Filter {
  <E, E2, A, B extends A>(
    result: AsyncResult<E, A>,
    refinement: (a: A) => a is B,
    ifFiltered: (a: A) => E2
  ): AsyncResult<E | E2, B>
  <E, E2, A, B extends A>(
    refinement: (a: A) => a is B,
    ifFiltered: (a: A) => E2
  ): (result: AsyncResult<E, A>) => AsyncResult<E, B>

  <E, E2, A>(
    result: AsyncResult<E, A>,
    predicate: (a: A) => boolean,
    ifFiltered: (a: A) => E2
  ): AsyncResult<E, A>
  <E, E2, A>(predicate: (a: A) => boolean, ifFiltered: (a: A) => E2): (
    result: AsyncResult<E, A>
  ) => AsyncResult<E, A>
}
const _filter = <E, E2, A, B extends A>(
  result: AsyncResult<E, A>,
  refinement: (a: A) => a is B,
  ifFiltered: (a: A) => E2
): AsyncResult<E | E2, B> => {
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
  AS extends [AsyncResult<any, any>, ...AsyncResult<any, any>[]]
>(
  ...ns: AS
): AsyncResult<
  unknown,
  { [K in keyof AS]: AS[K] extends Ok<infer U> ? U : never }
> => {
  let hadError = false
  let hadLoading = false
  let hadInitial = false

  for (const r of ns) {
    switch (r.kind) {
      case 'Error': {
        hadError = true
        break
      }
      case 'Initial': {
        hadInitial = true
        break
      }
      case 'Loading': {
        hadLoading = true
        break
      }
    }
  }

  if (hadError) return error(undefined)
  else if (hadLoading) return loading
  else if (hadInitial) return initial
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  else return ok(ns.map((n) => (n as Ok<unknown>).value)) as any
}

//#endregion

//#region Destructors

export const toUndefined = <A>(
  result: AsyncResult<unknown, A>
): A | undefined => (result.kind === 'Ok' ? result.value : undefined)

export const toNull = <A>(result: AsyncResult<unknown, A>): A | null =>
  result.kind === 'Ok' ? result.value : null

interface GetOrElse {
  <A>(result: AsyncResult<unknown, A>, a: () => A): A
  <A>(a: () => A): (result: AsyncResult<unknown, A>) => A
}
const _getOrElse = <A>(result: AsyncResult<unknown, A>, a: () => A): A =>
  result.kind === 'Ok' ? result.value : a()
export const getOrElse: GetOrElse = pipeable2(_getOrElse)

interface Match {
  <E, A, B>(
    result: AsyncResult<E, A>,
    ifInitial: () => B,
    ifLoading: () => B,
    ifOk: (a: A) => B,
    ifError: (e: E) => B
  ): B
  <E, A, B>(
    ifInitial: () => B,
    ifLoading: () => B,
    ifOk: (a: A) => B,
    ifError: (e: E) => B
  ): (result: AsyncResult<E, A>) => B
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _match(...args: any[]): any {
  if (arguments.length === 4) {
    const [ifInitial, ifLoading, ifOk, ifError] = args

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result: any) => {
      switch (result.kind) {
        case 'Initial':
          return ifInitial()
        case 'Loading':
          return ifLoading()
        case 'Ok':
          return ifOk(result.value)
        case 'Error':
          return ifError(result.error)
      }
    }
  }

  const [result, ifInitial, ifLoading, ifOk, ifError] = args
  switch (result.kind) {
    case 'Initial':
      return ifInitial()
    case 'Loading':
      return ifLoading()
    case 'Ok':
      return ifOk(result.value)
    case 'Error':
      return ifError(result.error)
  }
}
export const match: Match = _match

interface MatchShort {
  <E, A, B>(
    result: AsyncResult<E, A>,
    ifInitialOrLoading: () => B,
    ifOk: (a: A) => B,
    ifError: (e: E) => B
  ): B
  <E, A, B>(
    ifInitialOrLoading: () => B,
    ifOk: (a: A) => B,
    ifError: (e: E) => B
  ): (result: AsyncResult<E, A>) => B
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _matchShort(...args: any[]): any {
  if (arguments.length === 3) {
    const [ifInitialOrLoading, ifOk, ifError] = args

    return match(ifInitialOrLoading, ifInitialOrLoading, ifOk, ifError)
  }

  const [result, ifInitialOrLoading, ifOk, ifError] = args
  return match(result, ifInitialOrLoading, ifInitialOrLoading, ifOk, ifError)
}
export const matchShort: MatchShort = _matchShort

//#endregion
