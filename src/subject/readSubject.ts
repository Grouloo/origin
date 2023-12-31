import Database from 'bun:sqlite'
import { SubjectId } from '../types/SubjectId'
import { Triple } from '../triple/Triple'
import { Result } from 'shulk'
import { DatabaseError } from '../types/DatabaseError'
import { triplesToSubject } from './triplesToSubject'

export function readSubject(
   db: Database,
   uid: SubjectId,
   fields?: { [x: string]: string }
): Result<DatabaseError['NotFound'], object> {
   const triples: Triple[] = db
      .query(`SELECT * FROM triples WHERE subject = "${uid}"`)
      .all() as Triple[]

   const resultified = triplesToSubject(triples, fields).toResult(() =>
      DatabaseError.NotFound(`Subject ${uid} does not exist.`)
   )

   return resultified
}
