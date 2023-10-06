import { createSubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'
import { createTripleId } from '../types/TripleId'
import { saveTriple } from '../triple/saveTriple'
import Database from 'bun:sqlite'
import { Err, Ok, Result } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'

export function createSubject(
   db: Database,
   entity: { [x: string]: unknown }
): Result<DatabaseError['BadType' | 'Unexpected' | 'NotFound'], Triple[]> {
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
      const res = saveTriple(db, triple)

      if (res._state == 'Err') {
         return Err(res.val)
      }
   }

   return Ok(triples)
}
