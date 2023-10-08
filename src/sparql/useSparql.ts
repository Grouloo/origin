import Database from 'bun:sqlite'
import { isSubjectId } from '../types/SubjectId'
import { createSQLQuery } from '../functions/createSQLQuery'
import { Triple } from '../triple/Triple'
import { readSubject } from '../subject/readSubject'
import { Err, Ok, Result } from 'shulk'
import { parseSparql } from './parseSparql'

export function useSparql(db: Database, query: string): Result<string, object> {
   const parsedQueryOrError = parseSparql(query)

   if (parsedQueryOrError._state == 'Err') {
      return Err(parsedQueryOrError.val)
   }

   const parsedQuery = parsedQueryOrError.val

   const sqlQuery = createSQLQuery(Object.entries(parsedQuery.conditions))

   const triples: { subject: Triple['subject'] }[] = db
      .query(sqlQuery)
      .all() as Triple[]

   const tmp: { [x: Triple['subject']]: object } = {}

   triples.map((row) => {
      const subjetHasNotBeenFetched = !Object.keys(tmp).includes(row.subject)

      if (isSubjectId(row.subject) && subjetHasNotBeenFetched) {
         const subjectOrError = readSubject(db, row.subject, parsedQuery.fields)

         if (subjectOrError._state == 'Ok') {
            tmp[row.subject] = subjectOrError.val
         }
      }
   })

   return Ok(Object.entries(tmp).map(([id, element]) => ({ id, ...element })))
}
