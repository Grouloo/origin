import { Err, Maybe, None, Ok, Result, Some } from 'shulk'
import { Query } from '../types/Query'
import { createNumber } from '../functions/createNumber'

type SparqlTree = {
   head: {
      method: 'SELECT' | 'ASK'
      variables: string[] | '*'
   }
   body: {
      where: {
         variable: string
         predicate: string
         object: string
      }[]
      orderBy: {
         variable: string
         order: 'DESC' | 'ASC'
      }
      offset?: number
      limit?: number
   }
}

export function parseSparql(query: string): Result<string, Query> {
   const [_, fieldsStr, conditionsStr] = query.split(/SELECT|WHERE/g)

   if (!fieldsStr) {
      return Err('Missing fields.')
   }

   const fields = fieldsStr.split(' ').map((f) => f.slice(1))

   if (!conditionsStr) {
      return Err('Missing conditions.')
   }

   const conditions = conditionsStr.split(/{|\.}|;/g).slice(1, -1)

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
