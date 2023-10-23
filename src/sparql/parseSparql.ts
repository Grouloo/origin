import { Err, None, Ok, Result } from 'shulk'
import { createNumber } from '../functions/createNumber'

export type SparqlTree = {
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

export type Sparql = `${'SELECT' | 'ASK'} ${string} ${'WHERE'}`

function parseHead(sparql: string): Result<string, SparqlTree['head']> {
   const [method, ...fields] = sparql.split(' ')

   if (!method || (method !== 'SELECT' && method !== 'ASK')) {
      return Err(`Unknown method '${method}.'`)
   }

   if (fields.length == 1 && fields[0] == '*') {
      return Ok({ method, variables: '*' })
   }

   const variables = fields.map((field) => field.slice(1))

   return Ok({ method, variables })
}

function areConditionsCorrect(
   conditions: object[]
): conditions is { variable: string; predicate: string; object: string }[] {
   return conditions.every((pred) => !('_state' in pred))
}

function parseBody(sparql: string): Result<string, SparqlTree['body']> {
   const [, conditionsStr] = sparql.split(/[{\.}]/)

   if (!conditionsStr) {
      return Err('Missing conditions in query.')
   }

   const conditions = conditionsStr.trim().split(';')

   const where = conditions.map((condition) => {
      const [variable, predicate, object] = condition.trim().split(' ')

      if (!variable || !predicate || !object) {
         return None()
      }

      const parsedObject = createNumber(object)

      return {
         variable,
         field: variable,
         predicate,
         object: parsedObject.unwrapOr(object),
      }
   })

   const conditionsAreCorrect = areConditionsCorrect(where)

   if (!conditionsAreCorrect) {
      return Err(`Malformed condition. ${JSON.stringify(where)}`)
   }

   return Ok({ where, orderBy: { variable: 'id', order: 'ASC' } })
}

export function parseSparql(query: Sparql): Result<string, SparqlTree> {
   const [headStr, bodyStr] = query.split(/WHERE/g)

   if (!headStr) {
      return Err(`Missing head in query '${query}'.`)
   }

   if (!bodyStr) {
      return Err(`Missing body in query '${query}'`)
   }

   const [headOrError, bodyOrError] = [parseHead(headStr), parseBody(bodyStr)]

   if (headOrError._state == 'Err') {
      return Err(headOrError.val)
   }

   if (bodyOrError._state == 'Err') {
      return Err(bodyOrError.val)
   }

   const [head, body] = [headOrError.val, bodyOrError.val]

   const propertyToField: { [x: string]: string } = {}

   for (const field of head.variables) {
      propertyToField[field] = field
   }

   return Ok({ head, body })
}
