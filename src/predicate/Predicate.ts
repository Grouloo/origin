import { AllowedType } from '../types/AllowedType'
import { TripleId } from '../types/TripleId'

export type Predicate = {
   id: TripleId
   label: string
   type: AllowedType
}
