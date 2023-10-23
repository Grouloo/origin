import Database from 'bun:sqlite'
import { isSubjectId } from '../types/SubjectId'
import { createSQLQuery } from '../functions/createSQLQuery'
import { Triple } from '../triple/Triple'
import { readSubject } from '../subject/readSubject'
import { Maybe, None, Ok, Result, Some } from 'shulk'
import { Sparql, SparqlTree, parseSparql } from './parseSparql'

function createFieldToVariable(
   parsedQuery: SparqlTree
): Maybe<{ [x: string]: string }> {
   if (parsedQuery.head.variables == '*') {
      return None()
   }
   return Some({
      ...Object.fromEntries(
         parsedQuery.head.variables.map((variable) => {
            const parsedName = variable.replace('?', '')

            return [parsedName, parsedName]
         })
      ),
      ...Object.fromEntries(
         parsedQuery.body.where.map((condition) => [
            condition.predicate,
            condition.variable.replace('?', ''),
         ])
      ),
   })
}

export function useSparql(db: Database, query: Sparql): Result<string, object> {
   const results = parseSparql(query as any)
      .map((parsedQuery) => ({
         fieldToVariable: createFieldToVariable(parsedQuery),
         sqlQuery: createSQLQuery(parsedQuery.body.where),
      }))
      .flatMap(({ fieldToVariable, sqlQuery }) => {
         const triples: { subject: Triple['subject'] }[] = db
            .query(sqlQuery)
            .all() as Triple[]

         const tmp: { [x: Triple['subject']]: object } = {}

         triples.map((row) => {
            const subjetHasNotBeenFetchedYet = !Object.keys(tmp).includes(
               row.subject
            )

            if (isSubjectId(row.subject) && subjetHasNotBeenFetchedYet) {
               readSubject(
                  db,
                  row.subject,
                  fieldToVariable.unwrapOr(undefined)
               ).map((subject) => (tmp[row.subject] = subject))
            }
         })

         return Ok(
            Object.entries(tmp).map(([id, element]) => ({ id, ...element }))
         )
      })

   return results
}
