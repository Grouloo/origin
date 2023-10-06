import { Database } from 'bun:sqlite'
import { createSubjectId } from './types/SubjectId'
import Elysia from 'elysia'
import { useSparql } from './functions/useSparql'
import { readSubject } from './subject/readSubject'
import { createSubject } from './subject/createSubject'
import { listPredicate } from './predicate/listPredicates'

const db = new Database('./db.sqlite', { create: true })

try {
   db.transaction(() =>
      db.run(
         `CREATE TABLE triples (id VARCHAR PRIMARY KEY, subject VARCHAR, predicate VARCHAR, object)`
      )
   ).immediate()
} catch {}

new Elysia()
   .get(
      '/subjects/:uid',
      ({ params: { uid } }) => readSubject(db, createSubjectId(uid)).val
   )
   .post(
      '/subjects',
      ({ body }) => createSubject(db, body as { [x: string]: unknown }).val
   )
   .post('/sparql', ({ body }) => useSparql(db, body as string).val)
   .get('/schema', () => listPredicate(db).val)
   .listen(8080)

console.log('Listening on port 8080')
