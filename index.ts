import { Database } from 'bun:sqlite'
import { SubjectId, createSubjectId } from './src/types/SubjectId'
import { createTripleId } from './src/types/TripleId'
import Elysia from 'elysia'
import { tuple } from 'shulk'

const db = new Database('./db.sqlite', { create: true })
db.transaction(() =>
   db.run(
      `CREATE TABLE triples (id VARCHAR PRIMARY KEY, subject VARCHAR, predicate VARCHAR, object)`
   )
)

type Triple = {
   id: `T${string}`
   subject: SubjectId
   predicate: string
   object: unknown
}

function saveTriple(triple: Triple) {
   const object =
      typeof triple.object == 'string' ? `"${triple.object}"` : triple.object

   db.prepare(
      `
      INSERT INTO triples (id, subject, predicate, object) 
      VALUES ("${triple.id}", "${triple.subject}", "${triple.predicate}", ${object})
      `
   ).run()
}

function createSubject(entity: { [x: string]: unknown }) {
   const subjectId = createSubjectId()

   const triples = Object.entries(entity).map(([prop, value]) => {
      const triple: Triple = {
         id: createTripleId(),
         subject: subjectId,
         predicate: prop,
         object: value,
      }

      return triple
   })

   for (const triple of triples) {
      saveTriple(triple)
   }

   return triples
}

function readSubject(uid: SubjectId, fields?: string[]) {
   const triples: Triple[] = db
      .query(`SELECT * FROM triples WHERE subject = "${uid}"`)
      .all() as Triple[]

   const subject: { [x: string]: unknown } = { id: triples[0].subject }

   triples.map((triple: Triple) => {
      if (!fields || fields.includes(triple.predicate)) {
         subject[triple.predicate] = triple.object
      }
   })

   return subject
}

function useSparql(query: string) {
   const [_, fieldsStr, conditionsStr] = query.split(/SELECT|WHERE/g)

   const fields = fieldsStr.split(' ')

   console.log(fields)

   const conditions = conditionsStr.split(/{|}|\./g).slice(1, -1)

   const propertyToField: { [x: string]: string } = {}

   console.log(conditions)

   const q = conditions.map((condition) => {
      const [field, property, value] = condition.split(' ')

      propertyToField[property] = field

      return `(predicate = "${property}" AND object = "${value}")`
   })

   console.log(q.join(' & '))

   const triples: Triple[] = db
      .query(`SELECT * FROM triples WHERE ${q.join(' AND ')}`)
      .all() as Triple[]

   console.log(triples)

   const tmp: { [x: SubjectId]: { [x: string]: unknown } } = {}

   triples.map((triple: Triple) => {
      if (!Object.keys(tmp).includes(triple.subject)) {
         tmp[triple.subject] = readSubject(triple.subject, fields)
      }
   })

   return Object.entries(tmp).map(([id, element]) => ({ id, ...element }))
}

new Elysia()
   .post('/sparql', ({ body }) => {
      return useSparql(body as string)
   })
   .get('/subjects/:uid', ({ params: { uid } }) => {
      return readSubject(uid as SubjectId)
   })
   .post('/subjects', ({ body }) => {
      return createSubject(body as { [x: string]: unknown })
   })
   .listen(8080)

console.log('Listening on port 8080')
