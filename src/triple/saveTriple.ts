import Database from 'bun:sqlite'
import { Triple } from './Triple'

export function saveTriple(db: Database, triple: Triple) {
   const object =
      typeof triple.object == 'string' ? `"${triple.object}"` : triple.object

   db.prepare(
      `
      INSERT INTO triples (id, subject, predicate, object) 
      VALUES ("${triple.id}", "${triple.subject}", "${triple.predicate}", ${object})
      `
   ).run()
}
