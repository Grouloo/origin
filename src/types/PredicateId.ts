export type PredicateId = `predicate:${string}`

export function createPredicateId(label: string): PredicateId {
   return `predicate:${label}`
}
