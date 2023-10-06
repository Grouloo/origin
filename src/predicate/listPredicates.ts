import Database from 'bun:sqlite'
import { Triple } from '../triple/Triple'
import { Ok, Result } from 'shulk'
import { AllowedType } from '../types/AllowedType'

export function listPredicate(
   db: Database
): Result<string, { [x: string]: AllowedType }> {
   const triples: Triple[] = db
      .query(`SELECT * FROM triples WHERE subject LIKE "predicate:%"`)
      .all() as Triple[]

   const schema = Object.fromEntries(
      triples.map((triple) => {
         return [
            triple.subject.replace('predicate:', ''),
            triple.object as AllowedType,
         ]
      })
   )

   return Ok(schema)
}
