import { Maybe, None, Some } from 'shulk'
import { Triple } from '../triple/Triple'

function tripletoTuple(triple: Triple, fields?: { [x: string]: string }) {
   const { predicate } = triple

   if (fields && Object.hasOwn(fields, predicate)) {
      return [fields[predicate], triple.object]
   }

   return [triple.predicate, triple.object]
}

export function triplesToSubject(
   triples: Triple[],
   fields?: { [x: string]: string }
): Maybe<object> {
   if (!triples[0]) {
      return None()
   }

   const rawSubject = triples.map((triple: Triple) =>
      tripletoTuple(triple, fields)
   )

   rawSubject.unshift(['id', triples[0].subject.replace('subject:', '')])

   const subject = Object.fromEntries(rawSubject)

   return Some(subject)
}
