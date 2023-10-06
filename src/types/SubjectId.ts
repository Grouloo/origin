import { generateUid } from '../functions/generateUid'

export type SubjectId = `subject:${string}`

export function createSubjectId(uid?: string): SubjectId {
   if (!uid) {
      uid = generateUid(Date.now())
   }

   return `subject:${uid}`
}

export function isSubjectId(val: unknown): val is SubjectId {
   return typeof val == 'string' && val.startsWith('subject:')
}
