import Database from 'bun:sqlite'
import { createSubject } from '../subject/createSubject'
import { AllowedType } from '../types/AllowedType'
import { LLMHandler } from '../types/LLM'
import { DatabaseError } from '../types/DatabaseError'
import { Err, resultify } from 'shulk'

const PRE_PROMPT = `You are a knowledge base assistant.
The user will give you a description in natural language of something to insert into the knowledge base, and you will respond with ONLY the JSON representation of the object to insert, and nothing else.
Here is the schema of the knowledge base in JSON, keys are properties names and values are types. You can use any property described, but you don't have to use any of them either:\n`

const PRE_PROMPT_2 = `\nyou can also specify a property that is not defined in the schema if it is missing and could be useful information, but when you use one that is, make sure to respect its type.
Make sure to respect JSON standards whzn specifying values. Strings must be surrounded by double quotes, but other values such as numbers and boolean don't.`

const safeJsonParse = resultify<SyntaxError, typeof JSON.parse>(JSON.parse)

export async function insertByTelling(
   db: Database,
   prompt: string,
   schema: { [x: string]: AllowedType },
   llmHandler: LLMHandler
) {
   const responseOrError = await llmHandler(
      PRE_PROMPT + JSON.stringify(schema, undefined, 2) + PRE_PROMPT_2,
      prompt
   )

   if (responseOrError._state == 'Err') {
      return Err(responseOrError.val)
   }

   const rawResponse = responseOrError.val

   const parsedResponseOrError = safeJsonParse(rawResponse.answer)

   if (parsedResponseOrError._state == 'Err') {
      return DatabaseError.Unexpected(
         `LLM returned data in a wrong format. Expected stringified JSON, got "${rawResponse}"`
      )
   }

   const parsedResponse = parsedResponseOrError.val

   return createSubject(db, parsedResponse)
}
