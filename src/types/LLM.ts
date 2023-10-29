import { AsyncResult } from 'shulk'
import { DatabaseError } from './DatabaseError'

export type LLMResponse = {
   answer: string
   usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
   }
}

export type LLMHandler = (
   prePrompt: string,
   prompt: string
) => AsyncResult<DatabaseError['any'], LLMResponse>
