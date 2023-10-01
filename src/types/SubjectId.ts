import { generateUid } from '../functions/generateUid'

export type SubjectId = `S${string}`

export function createSubjectId(): SubjectId {
   const uid = generateUid(Date.now())

   return `S${uid}`
}
