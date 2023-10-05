import { generateUid } from '../functions/generateUid'

export type TripleId = `triple:${string}`

export function createTripleId(): TripleId {
   const uid = generateUid(Date.now())

   return `triple:${uid}`
}
