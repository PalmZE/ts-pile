import { isOne, One, pipe } from '../internal/spec-utils'
import {
  combineTuple,
  exists,
  filter,
  flatMap,
  getOrElse,
  isError,
  isInitial,
  matchShort,
} from './async-result'
import {
  AsyncResult,
  error,
  initial,
  isLoading,
  isOk,
  loading,
  map,
  mapError,
  match,
  ok,
  toNull,
  toUndefined,
} from './async-result'

describe('async-result', () => {
  describe('toUndefined', () => {
    it('returns undefined if the result is Loading | Initial | Error', () => {
      expect(toUndefined(initial)).toStrictEqual(undefined)
      expect(toUndefined(loading)).toStrictEqual(undefined)
      expect(toUndefined(error('e'))).toStrictEqual(undefined)
    })

    it('returns value if the result is Ok', () => {
      expect(toUndefined(ok(1))).toStrictEqual(1)
    })
  })

  describe('toNull', () => {
    it('returns null if the result is Loading | Initial | Error', () => {
      expect(toNull(initial)).toStrictEqual(null)
      expect(toNull(loading)).toStrictEqual(null)
      expect(toNull(error('e'))).toStrictEqual(null)
    })

    it('returns value if the result is Ok', () => {
      expect(toNull(ok(1))).toStrictEqual(1)
    })
  })

  describe('ok', () => {
    it('constructs new Ok', () => {
      expect(ok(1)).toStrictEqual({ kind: 'Ok', value: 1 })
    })
  })

  describe('match', () => {
    const a = () => 'A'
    const b = () => 'B'
    const c = () => 'C'
    const d = () => 'D'

    it('returns ifOk branch if the result is Ok', () => {
      expect(match(ok(1), a, b, c, d)).toStrictEqual(d())
      expect(match(a, b, c, d)(ok(1))).toStrictEqual(d())
    })
    it('returns ifError branch if the result is Error', () => {
      expect(match(error('e'), a, b, c, d)).toStrictEqual(c())
      expect(match(a, b, c, d)(error('e'))).toStrictEqual(c())
    })
    it('returns ifLoading branch if the result is Loading', () => {
      expect(match(loading, a, b, c, d)).toStrictEqual(b())
      expect(match(a, b, c, d)(loading)).toStrictEqual(b())
    })
    it('returns ifInitial branch if the result is Initial', () => {
      expect(match(initial, a, b, c, d)).toStrictEqual(a())
      expect(match(a, b, c, d)(initial)).toStrictEqual(a())
    })
  })

  describe('matchShort', () => {
    const a = () => 'A'
    const b = () => 'B'
    const c = () => 'C'

    it('returns ifOk branch if the result is Ok', () => {
      expect(matchShort(ok(1), a, b, c)).toStrictEqual(c())
      expect(matchShort(a, b, c)(ok(1))).toStrictEqual(c())
    })
    it('returns ifError branch if the result is Error', () => {
      expect(matchShort(error('e'), a, b, c)).toStrictEqual(b())
      expect(matchShort(a, b, c)(error('e'))).toStrictEqual(b())
    })
    it('returns ifLoadingOrInitial branch if the result is Loading', () => {
      expect(matchShort(loading, a, b, c)).toStrictEqual(a())
      expect(matchShort(a, b, c)(loading)).toStrictEqual(a())
    })
    it('returns ifLoadingOrInitial branch if the result is Initial', () => {
      expect(matchShort(initial, a, b, c)).toStrictEqual(a())
      expect(matchShort(a, b, c)(initial)).toStrictEqual(a())
    })
  })

  describe('mapError', () => {
    const f = () => 'error'

    it('returns f(error) if the result is Error', () => {
      expect(mapError(error('e'), f)).toStrictEqual(error('error'))
      expect(mapError(f)(error('e'))).toStrictEqual(error('error'))
    })

    it('returns result if the result is Ok | Loading | Initial', () => {
      expect(mapError(initial, f)).toStrictEqual(initial)
      expect(mapError(f)(initial)).toStrictEqual(initial)

      expect(mapError(loading, f)).toStrictEqual(loading)
      expect(mapError(f)(loading)).toStrictEqual(loading)

      expect(mapError(ok(1), f)).toStrictEqual(ok(1))
      expect(mapError(f)(ok(1))).toStrictEqual(ok(1))
    })
  })

  describe('map', () => {
    const f = (n: number) => n + 1

    it('returns f(value) if the result is Ok', () => {
      expect(map(ok(1), f)).toStrictEqual(ok(2))
      expect(map(f)(ok(1))).toStrictEqual(ok(2))
    })

    it('returns the result if the result is Error | Loading | Initial', () => {
      expect(map(initial, f)).toStrictEqual(initial)
      expect(map(f)(initial)).toStrictEqual(initial)

      expect(map(loading, f)).toStrictEqual(loading)
      expect(map(f)(loading)).toStrictEqual(loading)

      expect(map(error('e') as AsyncResult<string, number>, f)).toStrictEqual(
        error('e')
      )
      expect(map(f)(error('e'))).toStrictEqual(error('e'))
    })
  })

  describe('isOk', () => {
    it('returns true if the result is Ok', () => {
      expect(isOk(ok(1))).toStrictEqual(true)
    })

    it('returns false if the result is Error | Loading | Initial', () => {
      expect(isOk(initial)).toStrictEqual(false)
      expect(isOk(loading)).toStrictEqual(false)
      expect(isOk(error('e'))).toStrictEqual(false)
    })
  })

  describe('isLoading', () => {
    it('returns true if the result is Loading', () => {
      expect(isLoading(loading)).toStrictEqual(true)
    })

    it('returns false if the result is Error | Ok | Initial', () => {
      expect(isLoading(initial)).toStrictEqual(false)
      expect(isLoading(ok(1))).toStrictEqual(false)
      expect(isLoading(error('e'))).toStrictEqual(false)
    })
  })

  describe('isInitial', () => {
    it('returns true if the result is Initial', () => {
      expect(isInitial(initial)).toStrictEqual(true)
    })

    it('returns false if the result is Error | Ok | Loading', () => {
      expect(isInitial(loading)).toStrictEqual(false)
      expect(isInitial(ok(1))).toStrictEqual(false)
      expect(isInitial(error('e'))).toStrictEqual(false)
    })
  })

  describe('isError', () => {
    it('returns true if the result is Error', () => {
      expect(isError(error('e'))).toStrictEqual(true)
    })

    it('returns false if the result is Initial | Ok | Loading', () => {
      expect(isError(initial)).toStrictEqual(false)
      expect(isError(loading)).toStrictEqual(false)
      expect(isError(ok(1))).toStrictEqual(false)
    })
  })

  describe('getOrElse', () => {
    const ifElse = () => 100

    it('returns value if the result is Ok', () => {
      expect(getOrElse(ok(1), ifElse)).toStrictEqual(1)
      expect(getOrElse(ifElse)(ok(1))).toStrictEqual(1)
    })

    it('returns else part if the result is Error | Loading | Initial', () => {
      expect(getOrElse(initial, ifElse)).toStrictEqual(100)
      expect(getOrElse(ifElse)(initial)).toStrictEqual(100)

      expect(getOrElse(loading, ifElse)).toStrictEqual(100)
      expect(getOrElse(ifElse)(loading)).toStrictEqual(100)

      expect(getOrElse(error('e'), ifElse)).toStrictEqual(100)
      expect(getOrElse(ifElse)(error('e'))).toStrictEqual(100)
    })
  })

  describe('flatMap', () => {
    const fOk = () => ok(10)
    const fError = () => error('ERROR')
    const fLoading = () => loading
    const fInitial = () => initial

    it('returns the result if the result is Error | Initial | Loading', () => {
      // Initial
      expect(flatMap(initial, fOk)).toStrictEqual(initial)
      expect(flatMap(initial, fError)).toStrictEqual(initial)
      expect(flatMap(initial, fInitial)).toStrictEqual(initial)
      expect(flatMap(initial, fLoading)).toStrictEqual(initial)

      expect(flatMap(fOk)(initial)).toStrictEqual(initial)
      expect(flatMap(fError)(initial)).toStrictEqual(initial)
      expect(flatMap(fInitial)(initial)).toStrictEqual(initial)
      expect(flatMap(fLoading)(initial)).toStrictEqual(initial)

      // Loading
      expect(flatMap(loading, fOk)).toStrictEqual(loading)
      expect(flatMap(loading, fError)).toStrictEqual(loading)
      expect(flatMap(loading, fInitial)).toStrictEqual(loading)
      expect(flatMap(loading, fLoading)).toStrictEqual(loading)

      expect(flatMap(fOk)(loading)).toStrictEqual(loading)
      expect(flatMap(fError)(loading)).toStrictEqual(loading)
      expect(flatMap(fInitial)(loading)).toStrictEqual(loading)
      expect(flatMap(fLoading)(loading)).toStrictEqual(loading)

      // Error
      expect(flatMap(error('e'), fOk)).toStrictEqual(error('e'))
      expect(flatMap(error('e'), fError)).toStrictEqual(error('e'))
      expect(flatMap(error('e'), fInitial)).toStrictEqual(error('e'))
      expect(flatMap(error('e'), fLoading)).toStrictEqual(error('e'))

      expect(flatMap(fOk)(error('e'))).toStrictEqual(error('e'))
      expect(flatMap(fError)(error('e'))).toStrictEqual(error('e'))
      expect(flatMap(fInitial)(error('e'))).toStrictEqual(error('e'))
      expect(flatMap(fLoading)(error('e'))).toStrictEqual(error('e'))
    })

    it('returns the output of f(value) if the result is Ok', () => {
      expect(flatMap(ok(1), fOk)).toStrictEqual(fOk())
      expect(flatMap(fOk)(ok(1))).toStrictEqual(fOk())

      expect(flatMap(ok(1), fError)).toStrictEqual(fError())
      expect(flatMap(fError)(ok(1))).toStrictEqual(fError())

      expect(flatMap(ok(1), fInitial)).toStrictEqual(fInitial())
      expect(flatMap(fInitial)(ok(1))).toStrictEqual(fInitial())

      expect(flatMap(ok(1), fLoading)).toStrictEqual(fLoading())
      expect(flatMap(fLoading)(ok(1))).toStrictEqual(fLoading())
    })
  })

  describe('filter', () => {
    it('refinement type works', () => {
      const r: AsyncResult<string, number> = ok(42)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const one1: AsyncResult<string | number, One> = filter(
        r,
        isOne,
        () => 'Error'
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const one2: AsyncResult<string | number, One> = pipe(
        r,
        filter(isOne, () => 'Error')
      )

      expect(true).toBeTruthy()
    })

    it('returns value if the predicate returns true', () => {
      expect(filter(ok(1), isOne, () => 'E')).toStrictEqual(ok(1))
      expect(filter(isOne, () => 'E')(ok(1))).toStrictEqual(ok(1))
    })

    it('returns error if the predicate returns false', () => {
      expect(filter(ok(2), isOne, () => 'E')).toStrictEqual(error('E'))
      expect(filter(isOne, () => 'E')(ok(2))).toStrictEqual(error('E'))
    })

    it('returns the result if the result is Error | Initial | Loading', () => {
      expect(filter(initial, isOne, () => 'E')).toStrictEqual(initial)
      expect(filter(isOne, () => 'E')(initial)).toStrictEqual(initial)

      expect(filter(loading, isOne, () => 'E')).toStrictEqual(loading)
      expect(filter(isOne, () => 'E')(loading)).toStrictEqual(loading)

      expect(
        filter(error(0) as AsyncResult<string, number>, isOne, () => 'E')
      ).toStrictEqual(error(0))
      expect(filter(isOne, () => 'E')(error(0))).toStrictEqual(error(0))
    })
  })

  describe('exists', () => {
    it('refinement type works', () => {
      const r: AsyncResult<string, number> = ok(42)
      if (exists(r, isOne)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const one1: AsyncResult<string, One> = r
      }
      if (exists(isOne)(r)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const one2: AsyncResult<string, One> = r
      }

      expect(true).toBeTruthy()
    })

    it('returns true if the predicate returns true', () => {
      expect(exists(ok(1), isOne)).toStrictEqual(true)
      expect(exists(isOne)(ok(1))).toStrictEqual(true)
    })

    it('returns false if the predicate returns false', () => {
      expect(exists(ok(2), isOne)).toStrictEqual(false)
      expect(exists(isOne)(ok(2))).toStrictEqual(false)
    })

    it('returns false if the result is Error | Initial | Loading', () => {
      expect(exists(initial, isOne)).toStrictEqual(false)
      expect(exists(isOne)(initial)).toStrictEqual(false)

      expect(exists(loading, isOne)).toStrictEqual(false)
      expect(exists(isOne)(loading)).toStrictEqual(false)

      const r: AsyncResult<string, number> = error('e')
      expect(exists(r, isOne)).toStrictEqual(false)
      expect(exists(isOne)(r)).toStrictEqual(false)
    })
  })

  describe('error', () => {
    it('constructs Error', () => {
      expect(error(4)).toStrictEqual({ kind: 'Error', error: 4 })
    })
  })

  describe('combineTuple', () => {
    it('returns Initial if the tuple contains at least one Initial', () => {
      expect(combineTuple(ok(1), initial)).toStrictEqual(initial)
    })

    it('returns Loading if the value contains at least one Loading', () => {
      expect(combineTuple(ok(1), initial, loading)).toStrictEqual(loading)
    })

    it('returns Error if the value contains at least one Eoading', () => {
      expect(combineTuple(ok(1), initial, loading, error('e'))).toStrictEqual(
        error(undefined)
      )
    })

    it('returns Ok with values if the tuple does not contain a single error', () => {
      expect(combineTuple(ok('2'), ok(true), ok(42))).toStrictEqual(
        ok(['2', true, 42])
      )
    })
  })
})
