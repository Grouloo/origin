import { SparqlTree } from '../sparql/parseSparql'

export function createSQLQuery(
   conditions: SparqlTree['body']['where']
): string {
   if (!conditions[0]) {
      return ''
   }

   const { predicate, object } = conditions[0]

   const condition = `(predicate = "${predicate}" AND object = ${
      typeof object == 'string' ? `"${object}"` : object
   })`

   if (conditions.length == 1) {
      return `SELECT subject FROM triples WHERE ${condition}`
   }
   return `SELECT subject FROM triples WHERE ${condition} AND subject IN (${createSQLQuery(
      conditions.slice(1)
   )})`
}
