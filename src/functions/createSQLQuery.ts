export function createSQLQuery(parts: [string, unknown][]): string {
   const [property, value] = parts[0]

   const condition = `(predicate = "${property}" AND object = ${
      typeof value == 'string' ? `"${value}"` : value
   })`

   console.log(condition)

   if (parts.length == 1) {
      return `SELECT subject FROM triples WHERE ${condition}`
   }
   return `SELECT subject FROM triples WHERE ${condition} AND subject IN (${createSQLQuery(
      parts.slice(1)
   )})`
}
