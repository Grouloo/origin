import Database from 'bun:sqlite'
import { PredicateId } from '../types/PredicateId'
import { Triple } from '../triple/Triple'
import { Err, Ok, Result } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'
import { Predicate } from './Predicate'

export function readPredicate(
   db: Database,
   uid: PredicateId
): Result<DatabaseError['NotFound'], Predicate> {
   const [triple]: Triple[] = db
      .query(`SELECT * FROM triples WHERE subject = "${uid}"`)
      .all() as Triple[]

   if (!triple) {
      return Err(DatabaseError.NotFound('Predicate not found'))
   }

   const predicate: Predicate = {
      id: triple.id,
      label: triple.subject.replace('predicate:', ''),
      type: triple.object as Predicate['type'],
   }

   return Ok(predicate)
}
