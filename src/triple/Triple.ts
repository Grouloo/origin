import { PredicateId } from '../types/PredicateId'
import { SubjectId } from '../types/SubjectId'
import { TripleId } from '../types/TripleId'

export type Triple = {
   id: TripleId
   subject: SubjectId | PredicateId
   predicate: string
   object: unknown
}
