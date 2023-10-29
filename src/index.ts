import { Database } from 'bun:sqlite'
import { createSubjectId } from './types/SubjectId'
import Elysia, { t } from 'elysia'
import { useSparql } from './sparql/useSparql'
import { readSubject } from './subject/readSubject'
import { createSubject } from './subject/createSubject'
import { listPredicate } from './predicate/listPredicates'
import { insertByTelling } from './functions/insertByTelling'
import { useChatGPT } from './functions/useChatGPT'
import { DatabaseError } from './types/DatabaseError'
import { Sparql } from './sparql/parseSparql'
import { match } from 'shulk'
import { swagger } from '@elysiajs/swagger'

const db = new Database('./db.sqlite', { create: true })

try {
   db.transaction(() =>
      db.run(
         `CREATE TABLE triples (id VARCHAR PRIMARY KEY, subject VARCHAR, predicate VARCHAR, object)`
      )
   ).immediate()
} catch {}

new Elysia()
   .use(swagger())
   .onAfterHandle((context) =>
      match(context.response as DatabaseError['any'])
         .returnType<any>()
         .case({
            Unexpected: ({ val: err }) => {
               context.set.status = 500
               return err
            },
            BadType: ({ val: err }) => {
               context.set.status = 400
               return err
            },
            NotFound: ({ val: err }) => {
               context.set.status = 404
               return err
            },
            _otherwise: (val: any) => val,
         })
   )
   .get(
      '/subjects/:uid',
      ({ params: { uid } }) => readSubject(db, createSubjectId(uid)).val
   )
   .post(
      '/subjects',
      async ({ body }) =>
         (await createSubject(db, body as { [x: string]: unknown })).val
   )
   .post('/sparql', ({ body }) => useSparql(db, body as Sparql).val, {
      body: t.String(),
   })
   .post(
      '/tell',
      async ({ body }) => {
         const apiKey = process.env.OPENAI_API_KEY

         if (apiKey == undefined) {
            return DatabaseError.Unexpected(
               'You need an OpenAI API key to use the natural language features.'
            )
         }

         return (
            await insertByTelling(
               db,
               body as string,
               listPredicate(db).unwrap(),
               useChatGPT(apiKey)
            )
         ).val
      },
      { body: t.String() }
   )
   .get('/schema', () => listPredicate(db).val)
   .listen(8080)

console.log('Listening on port 8080')
