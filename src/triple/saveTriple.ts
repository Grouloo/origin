import Database from 'bun:sqlite'
import { Triple } from './Triple'
import { Err, Ok, Result, match } from 'shulk'
import { readPredicate } from '../predicate/readPredicate'
import { createPredicateId } from '../types/PredicateId'
import { DatabaseError } from '../types/DatabaseError'
import { savePredicate } from '../predicate/savePredicate'
import { createTripleId } from '../types/TripleId'
import { Predicate } from '../predicate/Predicate'
import { isAllowedType } from '../types/AllowedType'
import { insertTriple } from './insertTriple'

export function saveTriple(
   db: Database,
   triple: Triple
): Result<DatabaseError['Unexpected' | 'NotFound' | 'BadType'], true> {
   const objectType = typeof triple.object

   if (!isAllowedType(objectType)) {
      return Err(
         DatabaseError.BadType(
            `Type '${objectType}' is not allowed. (Property '${triple.predicate}')`
         )
      )
   }

   const predicateOrError = readPredicate(
      db,
      createPredicateId(triple.predicate)
   )

   if (predicateOrError._state == 'Err') {
      const wentWell = match(predicateOrError.val)
         .returnType<Result<DatabaseError['any'], true>>()
         .case({
            NotFound: () => {
               const newPredicate: Predicate = {
                  id: createTripleId(),
                  label: triple.predicate,
                  type: objectType,
               }

               return savePredicate(db, newPredicate)
            },
         })

      if (wentWell.isErr()) {
         return Err(wentWell.val)
      }
   } else {
      const predicate = predicateOrError.val

      if (objectType !== predicate.type) {
         return Err(
            DatabaseError.BadType(
               `Type '${objectType}' can not be used for property '${triple.predicate}'. Expected value of type '${predicate.type}'`
            )
         )
      }
   }

   return insertTriple(db, triple)
}
