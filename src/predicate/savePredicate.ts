import Database from 'bun:sqlite'
import { Predicate } from './Predicate'
import { DatabaseError } from '../types/DatabaseError'
import { Ok, Result } from 'shulk'
import { saveTriple } from '../triple/saveTriple'
import { Triple } from '../triple/Triple'
import { createPredicateId } from '../types/PredicateId'
import { insertTriple } from '../triple/insertTriple'

export function savePredicate(
   db: Database,
   predicate: Predicate
): Result<DatabaseError['Unexpected' | 'BadType' | 'NotFound'], true> {
   const triple: Triple = {
      id: predicate.id,
      subject: createPredicateId(predicate.label),
      predicate: 'type',
      object: predicate.type,
   }

   return insertTriple(db, triple)
}
