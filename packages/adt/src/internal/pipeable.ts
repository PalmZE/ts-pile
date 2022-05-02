export interface Pipeable2<A, B, C> {
  (a: A, b: B): C
  (b: B): (a: A) => C
}
export const pipeable2 = <A, B, C>(
  f: (a: A, b: B) => C
): Pipeable2<A, B, C> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function wrapper(...args: any[]) {
    if (arguments.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (a: any) => f(a, args[0])
    } else {
      return f(args[0], args[1])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return wrapper as any
}

export interface Pipeable3<A, B, C, D> {
  (a: A, b: B, c: C): D
  (b: B, c: C): (a: A) => C
}
export const pipeable3 = <A, B, C, D>(
  f: (a: A, b: B, c: C) => D
): Pipeable3<A, B, C, D> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function wrapper(...args: any[]) {
    if (arguments.length === 2) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (a: any) => f(a, args[0], args[1])
    } else {
      return f(args[0], args[1], args[2])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return wrapper as any
}
