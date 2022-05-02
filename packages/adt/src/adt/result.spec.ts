import { isOne, One, pipe } from '../internal/spec-utils'
import {
  combineTuple,
  error,
  exists,
  filter,
  flatMap,
  getOrElse,
  isError,
  isOk,
  map,
  mapError,
  match,
  ok,
  Result,
  toNull,
  toUndefined,
} from './result'

describe('result', () => {
  describe('toUndefined', () => {
    it('returns undefined if the result is Error', () => {
      expect(toUndefined(error('E'))).toStrictEqual(undefined)
    })

    it('returns value if the result is Ok', () => {
      expect(toUndefined(ok(1))).toStrictEqual(1)
    })
  })

  describe('toNull', () => {
    it('returns null if the result is Error', () => {
      expect(toNull(error('E'))).toStrictEqual(null)
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

    it('returns ifOk branch is the result is Ok', () => {
      expect(match(ok(1), a, b)).toStrictEqual('A')
      expect(match(a, b)(ok(1))).toStrictEqual('A')
    })

    it('returns ifError branch if the result is Error', () => {
      expect(match(error(0), a, b)).toStrictEqual('B')
      expect(match(a, b)(error(0))).toStrictEqual('B')
    })
  })

  describe('mapError', () => {
    const f = () => 'error'

    it('returns f(error) if the result is Error', () => {
      expect(mapError(error(42), f)).toStrictEqual(error('error'))
      expect(mapError(f)(error(42))).toStrictEqual(error('error'))
    })

    it('returns ok part if the result is Ok', () => {
      expect(mapError(ok(1), f)).toStrictEqual(ok(1))
      expect(mapError(f)(ok(1))).toStrictEqual(ok(1))
    })
  })

  describe('map', () => {
    const f = (n: number) => n + 10

    it('returns f(value) if the result is Ok', () => {
      expect(map(ok(10), f)).toStrictEqual(ok(20))
      expect(map(f)(ok(10))).toStrictEqual(ok(20))
    })

    it('returns error part if the result is Error', () => {
      const r: Result<unknown, number> = error('e')

      expect(map(r, f)).toStrictEqual(error('e'))
      expect(map(f)(r)).toStrictEqual(error('e'))
    })
  })

  describe('isOk', () => {
    it('returns true if the result is Ok', () => {
      expect(isOk(ok(1))).toStrictEqual(true)
    })

    it('returns false if the result is Error', () => {
      expect(isOk(error('e'))).toStrictEqual(false)
    })
  })

  describe('isError', () => {
    it('returns true if the result is Error', () => {
      expect(isError(error(1))).toStrictEqual(true)
    })

    it('returns false if the result is Ok', () => {
      expect(isError(ok(1))).toStrictEqual(false)
    })
  })

  describe('getOrElse', () => {
    it('returns value if the result is Ok', () => {
      expect(getOrElse(ok(1), () => 0)).toStrictEqual(1)
      expect(getOrElse(() => 0)(ok(1))).toStrictEqual(1)
    })

    it('returns else part if the result is Error', () => {
      expect(getOrElse(error('e'), () => 0)).toStrictEqual(0)
      expect(getOrElse(() => 0)(error('e'))).toStrictEqual(0)
    })
  })

  describe('flatMap', () => {
    const fOk = (n: number) => ok(n + 10)
    const fError = () => error('E')

    it('returns initial error if the result is error', () => {
      const r: Result<string, number> = error('A')

      expect(flatMap(r, fOk)).toStrictEqual(r)
      expect(flatMap(fOk)(r)).toStrictEqual(r)
    })

    it('returns the output of f(value) if the result is Ok', () => {
      expect(flatMap(ok(10), fOk)).toStrictEqual(ok(20))
      expect(flatMap(fOk)(ok(10))).toStrictEqual(ok(20))

      expect(flatMap(ok(10), fError)).toStrictEqual(error('E'))
      expect(flatMap(fError)(ok(10))).toStrictEqual(error('E'))
    })
  })

  describe('filter', () => {
    it('refinement type works', () => {
      const r: Result<number, number> = ok(4)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const one1: Result<string | number, One> = filter(r, isOne, () => 'error')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const one2: Result<string | number, One> = pipe(
        r,
        filter(isOne, () => 'error')
      )
    })

    it('returns value if the predicate returns true', () => {
      expect(filter(ok(1), isOne, () => 'error')).toStrictEqual(ok(1))
      expect(filter(isOne, () => 'error')(ok(1))).toStrictEqual(ok(1))
    })

    it('returns error if the predicate returns false', () => {
      expect(filter(ok(2), isOne, () => 'error')).toStrictEqual(error('error'))
      expect(filter(isOne, () => 'error')(ok(2))).toStrictEqual(error('error'))
    })

    it('returns original error if the result is Error', () => {
      const r: Result<string, number> = error('foo')
      expect(filter(r, isOne, () => 'error')).toStrictEqual(error('foo'))
      expect(filter(isOne, () => 'error')(r)).toStrictEqual(error('foo'))
    })
  })

  describe('exists', () => {
    it('refinement type works', () => {
      const r: Result<string, number> = ok(4)
      if (exists(r, isOne)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const one: Result<string, One> = r
      }
      if (exists(isOne)(r)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const one: Result<string, One> = r
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

    it('returns false if the result is Error', () => {
      const r: Result<unknown, number> = error('e')
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
    it('returns error if the tuple contains at least one error', () => {
      expect(combineTuple(ok(4), ok(true), ok(''), error(''))).toStrictEqual(
        error(undefined)
      )
    })

    it('returns tuple with values if the tuple does not contain a single error', () => {
      expect(combineTuple(ok(4), ok(true), ok(''))).toStrictEqual(
        ok([4, true, ''])
      )
    })
  })
})
