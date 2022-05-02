import { isOne, One } from '../internal/spec-utils'
import {
  combineTuple,
  exists,
  filter,
  getOrElse,
  isNonNullable,
  isNullOrUndefined,
  map,
  match,
  Nullable,
  toNull,
  toUndefined,
} from './nullable'

describe('nullable', () => {
  describe('toUndefined', () => {
    it('returns undefined if the value is undefined', () => {
      expect(toUndefined(undefined)).toEqual(undefined)
    })

    it('returns undefined if the value is null', () => {
      expect(toUndefined(null)).toEqual(undefined)
    })

    it('returns value if the value is NonNullable', () => {
      expect(toUndefined(0)).toEqual(0)
    })
  })

  describe('toNull', () => {
    it('returns null if the value is undefined', () => {
      expect(toNull(undefined)).toEqual(null)
    })

    it('returns null if the value is null', () => {
      expect(toNull(null)).toEqual(null)
    })

    it('returns value if the value is NonNullable', () => {
      expect(toNull(0)).toEqual(0)
    })
  })

  describe('match', () => {
    const a = () => 'A'
    const b = () => 'B'

    it('returns ifAbsent branch if value is null | undefined', () => {
      expect(match(null, a, b)).toStrictEqual(a())
      expect(match(a, b)(null)).toStrictEqual(a())

      expect(match(undefined, a, b)).toStrictEqual(a())
      expect(match(a, b)(undefined)).toStrictEqual(a())
    })

    it('returns ifPresent branch if value is non nullable', () => {
      expect(match(42, a, b)).toStrictEqual(b())
      expect(match(a, b)(42)).toStrictEqual(b())
    })
  })

  describe('map', () => {
    const f = (n: number) => n + 2

    it('return f(value) if the value is present', () => {
      expect(map(2, f)).toStrictEqual(4)
      expect(map(f)(2)).toStrictEqual(4)
    })

    it('return undefined if the value is absent', () => {
      expect(map(null, f)).toBeUndefined()
      expect(map(f)(null)).toBeUndefined()

      expect(map(undefined, f)).toBeUndefined()
      expect(map(f)(undefined)).toBeUndefined()
    })
  })

  describe('isNullOrUndefined', () => {
    it('returns true if the value is null or undefined', () => {
      expect(isNullOrUndefined(null)).toStrictEqual(true)
      expect(isNullOrUndefined(undefined)).toStrictEqual(true)
    })

    it('returns false if the value is non nullable', () => {
      expect(isNullOrUndefined(42)).toStrictEqual(false)
    })
  })

  describe('isNonNullable', () => {
    it('returns true if the value is non nullable', () => {
      expect(isNonNullable(42)).toStrictEqual(true)
    })

    it('returns false if the value is null or undefined', () => {
      expect(isNonNullable(undefined)).toStrictEqual(false)
      expect(isNonNullable(null)).toStrictEqual(false)
    })
  })

  describe('getOrElse', () => {
    it('returns else part if the value is null | undefined', () => {
      expect(getOrElse(null, () => 0)).toStrictEqual(0)
      expect(getOrElse(() => 0)(null)).toStrictEqual(0)

      expect(getOrElse(undefined, () => 0)).toStrictEqual(0)
      expect(getOrElse(() => 0)(undefined)).toStrictEqual(0)
    })

    it('returns value if the value is non nullable', () => {
      expect(getOrElse(42, () => 0)).toStrictEqual(42)
      expect(getOrElse(() => 0)(42)).toStrictEqual(42)
    })
  })

  describe('filter', () => {
    it('refinement type works', () => {
      const value: Nullable<number> = 42
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const one1: Nullable<One> = filter(value, isOne)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const one2: Nullable<One> = filter(isOne)(value)

      expect(true).toBeTruthy()
    })

    it('returns value if the predicate returns true', () => {
      expect(filter(1, isOne)).toStrictEqual(1)
      expect(filter(isOne)(1)).toStrictEqual(1)
    })

    it('returns undefined if predicate returns false', () => {
      expect(filter(2, isOne)).toBeUndefined()
      expect(filter(isOne)(2)).toBeUndefined()
    })

    it('returns undefined if the value is null | undefined', () => {
      expect(filter(null, isOne)).toBeUndefined()
      expect(filter(isOne)(null)).toBeUndefined()

      expect(filter(undefined, isOne)).toBeUndefined()
      expect(filter(isOne)(undefined)).toBeUndefined()
    })
  })

  describe('exists', () => {
    it('refinement type works', () => {
      const v: Nullable<number> = 42
      if (exists(v, isOne)) {
        // This should typecheck
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const one: One = v
      }
      if (exists(isOne)(v)) {
        // This should typecheck
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const one: One = v
      }

      expect(true).toBeTruthy()
    })

    it('returns true if the value is not null and predicate returns true', () => {
      expect(exists(1, isOne)).toStrictEqual(true)
      expect(exists(isOne)(1)).toStrictEqual(true)
    })

    it('returns false if the predicate returns false', () => {
      expect(exists(2, isOne)).toStrictEqual(false)
      expect(exists(isOne)(2)).toStrictEqual(false)
    })

    it('returns false if the value is null | undefined', () => {
      expect(exists(null, isOne)).toStrictEqual(false)
      expect(exists(isOne)(null)).toStrictEqual(false)

      expect(exists(undefined, isOne)).toStrictEqual(false)
      expect(exists(isOne)(undefined)).toStrictEqual(false)
    })
  })

  describe('combineTuple', () => {
    it('returns null if the tuple contains at least one nullable', () => {
      expect(combineTuple(42, '', false, null)).toBeUndefined()
      expect(combineTuple(42, '', false, undefined)).toBeUndefined()
    })

    it('returns tuple value if the tuple does not contain a single null', () => {
      expect(combineTuple(42, '', false)).toStrictEqual([42, '', false])
    })
  })
})
