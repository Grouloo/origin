import Database from 'bun:sqlite'
import { SubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'

export function readSubject(
   db: Database,
   uid: SubjectId,
   fields?: { [x: string]: string }
) {
   const triples: Triple[] = db
      .query(`SELECT * FROM triples WHERE subject = "${uid}"`)
      .all() as Triple[]

   const subject: { [x: string]: unknown } = { id: triples[0].subject }

   triples.map((triple: Triple) => {
      if (!fields) {
         subject[triple.predicate] = triple.object
      } else if (Object.hasOwn(fields, triple.predicate)) {
         subject[fields[triple.predicate]] = triple.object
      }
   })

   return subject
}
