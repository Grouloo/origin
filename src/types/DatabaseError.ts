import { State, state } from 'shulk'

export const DatabaseError = state<{
   Unexpected: string
   NotFound: string
   BadType: string
}>()
export type DatabaseError = State<typeof DatabaseError>
