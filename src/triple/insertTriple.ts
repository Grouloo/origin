import Database from 'bun:sqlite'
import { Triple } from './Triple'
import { Err, Ok, Result } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'

export function insertTriple(
   db: Database,
   triple: Triple
): Result<DatabaseError['Unexpected'], true> {
   try {
      const object =
         typeof triple.object == 'string' ? `"${triple.object}"` : triple.object

      db.prepare(
         `
      INSERT INTO triples (id, subject, predicate, object) 
      VALUES ("${triple.id}", "${triple.subject}", "${triple.predicate}", ${object})
      `
      ).run()

      return Ok(true)
   } catch (e) {
      return Err(DatabaseError.Unexpected((e as Error).message))
   }
}
