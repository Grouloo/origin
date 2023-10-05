import Database from 'bun:sqlite'
import { SubjectId } from '../types/SubjectId'
import { createSQLQuery } from './createSQLQuery'
import { Triple } from '../triple/Triple'
import { readSubject } from '../subject/readSubject'
import { Maybe, None, Ok, Some } from 'shulk'

type Query = {
   fields: { [x: string]: string }
   conditions: { [x: string]: unknown }
}

function createNumber(val: string): Maybe<number> {
   const parsedVal = Number(val)

   return Number.isNaN(parsedVal) ? None() : Some(parsedVal)
}

function parseSparql(query: string): Query {
   const [_, fieldsStr, conditionsStr] = query.split(/SELECT|WHERE/g)

   const fields = fieldsStr.split(' ').map((f) => f.slice(1))

   const conditions = conditionsStr.split(/{|}|\./g).slice(1, -1)

   const propertyToField: { [x: string]: string } = {}

   for (const field of fields) {
      propertyToField[field] = field
   }

   const parsedConditions = Object.fromEntries(
      conditions.map((condition) => {
         const [field, property, value] = condition.split(' ')

         const parsed = field.slice(1)
         propertyToField[property] = parsed

         const parsedValue = createNumber(value)

         return [property, parsedValue.unwrapOr(value)]
      })
   )

   return { fields: propertyToField, conditions: parsedConditions }
}

export function useSparql(db: Database, query: string) {
   const parsedQuery = parseSparql(query)

   const sqlQuery = createSQLQuery(Object.entries(parsedQuery.conditions))

   const triples: { subject: SubjectId }[] = db
      .query(sqlQuery)
      .all() as Triple[]

   const tmp: { [x: SubjectId]: { [x: string]: unknown } } = {}

   triples.map((row) => {
      if (!Object.keys(tmp).includes(row.subject)) {
         tmp[row.subject] = readSubject(db, row.subject, parsedQuery.fields)
      }
   })

   return Object.entries(tmp).map(([id, element]) => ({ id, ...element }))
}
