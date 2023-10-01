import { generateUid } from '../functions/generateUid'

export type TripleId = `T${string}`

export function createTripleId(): TripleId {
   const uid = generateUid(Date.now())

   return `T${uid}`
}
