export type One = 1
export const isOne = (n: number): n is One => n === 1

export function pipe<A, B>(a: A, ab: (a: A) => B): B {
  return ab(a)
}
