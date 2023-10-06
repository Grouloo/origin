import Database from 'bun:sqlite'
import { SubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'
import { Err, Ok, Result } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'

export function readSubject(
   db: Database,
   uid: SubjectId,
   fields?: { [x: string]: string }
): Result<DatabaseError['NotFound'], object> {
   const triples: Triple[] = db
      .query(`SELECT * FROM triples WHERE subject = "${uid}"`)
      .all() as Triple[]

   if (!triples[0]) {
      return Err(DatabaseError.NotFound(`Subject ${uid} does not exist.`))
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

   return Ok(subject)
}
