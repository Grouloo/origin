import { createSubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'
import { createTripleId } from '../types/TripleId'
import { saveTriple } from '../triple/saveTriple'
import Database from 'bun:sqlite'
import { Err, Ok, Result, match } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'
import { triplesToSubject } from './triplesToSubject'

export function createSubject(
   db: Database,
   entity: { [x: string]: unknown }
): Result<DatabaseError['BadType' | 'Unexpected' | 'NotFound'], object> {
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

   return match(triplesToSubject(triples))
      .returnType<Result<DatabaseError['Unexpected'], object>>()
      .case({
         None: () =>
            Err(DatabaseError.Unexpected(`An unexpected error has occured.`)),
         Some: ({ val }) => Ok(val),
      })
}
