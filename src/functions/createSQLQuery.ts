export function createSQLQuery(parts: [string, unknown][]): string {
   if (!parts[0]) {
      return ''
   }

   const [property, value] = parts[0]

   const condition = `(predicate = "${property}" AND object = ${
      typeof value == 'string' ? `"${value}"` : value
   })`

   if (parts.length == 1) {
      return `SELECT subject FROM triples WHERE ${condition}`
   }
   return `SELECT subject FROM triples WHERE ${condition} AND subject IN (${createSQLQuery(
      parts.slice(1)
   )})`
}
