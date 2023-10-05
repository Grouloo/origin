import { SubjectId } from '../types/SubjectId'
import { TripleId } from '../types/TripleId'

export type Triple = {
   id: TripleId
   subject: SubjectId
   predicate: string
   object: unknown
}
