import { AsyncResult, Ok, Result } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'
import { LLMResponse } from '../types/LLM'

export function useChatGPT(apiKey: string) {
   return async (
      prePrompt: string,
      prompt: string
   ): AsyncResult<DatabaseError, LLMResponse> => {
      console.log(prePrompt, prompt)

      const rawResponse = await fetch(
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

      console.log(rawResponse)

      const parsedResponse = await rawResponse.json()

      console.log(parsedResponse.choices[0].message.content)

      return Ok({
         answer: parsedResponse.choices[0].message.content,
         usage: {
            promptTokens: parsedResponse.usage.prompt_tokens,
            completionTokens: parsedResponse.usage.completion_tokens,
            totalTokens: parsedResponse.usage.totalTokens,
         },
      })
   }
}
