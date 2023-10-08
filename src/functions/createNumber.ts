import { Maybe, None, Some } from 'shulk'

export function createNumber(val: string): Maybe<number> {
   const parsedVal = Number(val)

   return Number.isNaN(parsedVal) ? None() : Some(parsedVal)
}
