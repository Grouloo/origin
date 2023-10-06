import Database from 'bun:sqlite'
import { SubjectId, isSubjectId } from '../types/SubjectId'
import { createSQLQuery } from './createSQLQuery'
import { Triple } from '../triple/Triple'
import { readSubject } from '../subject/readSubject'
import { Err, Maybe, None, Ok, Result, Some } from 'shulk'

type Query = {
   fields: { [x: string]: string }
   conditions: { [x: string]: unknown }
}

function createNumber(val: string): Maybe<number> {
   const parsedVal = Number(val)

   return Number.isNaN(parsedVal) ? None() : Some(parsedVal)
}

function parseSparql(query: string): Result<string, Query> {
   const [_, fieldsStr, conditionsStr] = query.split(/SELECT|WHERE/g)

   if (!fieldsStr) {
      return Err('Missing fields.')
   }

   const fields = fieldsStr.split(' ').map((f) => f.slice(1))

   if (!conditionsStr) {
      return Err('Missing conditions.')
   }

   const conditions = conditionsStr.split(/{|}|\./g).slice(1, -1)

   const propertyToField: { [x: string]: string } = {}

   for (const field of fields) {
      propertyToField[field] = field
   }

   let error: Maybe<string> = None()

   const parsedConditions = Object.fromEntries(
      conditions.map((condition) => {
         const [field, property, value] = condition.split(' ')

         if (!field || !property || !value) {
            error = Some('Malformed condition')

            return ['', '']
         }

         const parsed = field.slice(1)
         propertyToField[property] = parsed

         const parsedValue = createNumber(value)

         return [property, parsedValue.unwrapOr(value)]
      })
   )

   if (error._state == 'Some') {
      return Err(error.val)
   }

   return Ok({ fields: propertyToField, conditions: parsedConditions })
}

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
