import { Err, Maybe, None, Ok, Result, Some } from 'shulk'
import { Triple } from '../triple/Triple'
import { DatabaseError } from '../types/DatabaseError'

export function triplesToSubject(
   triples: Triple[],
   fields?: { [x: string]: string }
): Maybe<object> {
   if (!triples[0]) {
      return None()
   }

   const subject: { [x: string]: unknown } = {
      id: triples[0].subject.replace('subject:', ''),
   }

   triples.map((triple: Triple) => {
      const { predicate } = triple

      if (!fields) {
         subject[triple.predicate] = triple.object
      } else if (Object.hasOwn(fields, predicate)) {
         subject[fields[predicate] as string] = triple.object
      }
   })

   return Some(subject)
}
