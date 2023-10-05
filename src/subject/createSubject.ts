import { createSubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'
import { createTripleId } from '../types/TripleId'
import { saveTriple } from '../triple/saveTriple'
import Database from 'bun:sqlite'

export function createSubject(db: Database, entity: { [x: string]: unknown }) {
   const subjectId = createSubjectId()

   const triples = Object.entries(entity).map(([prop, value]) => {
      const triple: Triple = {
         id: createTripleId(),
         subject: subjectId,
         predicate: prop,
         object: value,
      }

      return triple
   })

   for (const triple of triples) {
      saveTriple(db, triple)
   }

   return triples
}
