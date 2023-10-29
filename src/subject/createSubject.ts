import { createSubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'
import { createTripleId } from '../types/TripleId'
import { saveTriple } from '../triple/saveTriple'
import Database from 'bun:sqlite'
import { AsyncResult, Procedure } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'
import { triplesToSubject } from './triplesToSubject'

export async function createSubject(
   db: Database,
   entity: { [x: string]: unknown }
): AsyncResult<DatabaseError['BadType' | 'Unexpected' | 'NotFound'], object> {
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

   const storeTriplesRoutines = triples.map(
      (triple) => async () => saveTriple(db, triple)
   )

   const storingTriplesResult = await Procedure.start()
      .parallelize<DatabaseError['any'], true[]>(...storeTriplesRoutines)
      .end()

   return storingTriplesResult.flatMap(() =>
      triplesToSubject(triples).toResult(() =>
         DatabaseError.Unexpected(`An unexpected error has occured.`)
      )
   )
}
