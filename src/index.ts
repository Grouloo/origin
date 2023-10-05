import { Database } from 'bun:sqlite'
import { createSubjectId } from './types/SubjectId'
import Elysia from 'elysia'
import { useSparql } from './functions/useSparql'
import { readSubject } from './subject/readSubject'
import { createSubject } from './subject/createSubject'

const db = new Database('./db.sqlite', { create: true })
db.transaction(() => false)

// db.run(
//    `CREATE TABLE triples (id VARCHAR PRIMARY KEY, subject VARCHAR, predicate VARCHAR, object)`
// )

new Elysia()
   .post('/sparql', ({ body }) => useSparql(db, body as string))
   .get('/subjects/:uid', ({ params: { uid } }) =>
      readSubject(db, createSubjectId(uid))
   )
   .post('/subjects', ({ body }) =>
      createSubject(db, body as { [x: string]: unknown })
   )
   .listen(8080)

console.log('Listening on port 8080')
