import { AsyncResult, Ok, asyncResultify } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'
import { LLMResponse } from '../types/LLM'

const safeFetch = asyncResultify<Error, typeof fetch>(fetch)

export function useChatGPT(apiKey: string) {
   return async (
      prePrompt: string,
      prompt: string
   ): AsyncResult<DatabaseError['Unexpected'], LLMResponse> => {
      const rawResponseResult = await safeFetch(
         'https://api.openai.com/v1/chat/completions',
         {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${apiKey}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               model: 'gpt-3.5-turbo',
               messages: [
                  {
                     role: 'system',
                     content: prePrompt,
                  },
                  {
                     role: 'user',
                     content: prompt,
                  },
               ],
            }),
         }
      )

      const parsedResponse = await rawResponseResult
         .mapErr((err) => DatabaseError.Unexpected(err.message))
         .flatMapAsync(async (rawResponse) => Ok(await rawResponse.json()))

      const llmResponseResult = parsedResponse.map((parsedResponse) => ({
         answer: parsedResponse.choices[0].message.content,
         usage: {
            promptTokens: parsedResponse.usage.prompt_tokens,
            completionTokens: parsedResponse.usage.completion_tokens,
            totalTokens: parsedResponse.usage.totalTokens,
         },
      }))

      return llmResponseResult
   }
}
