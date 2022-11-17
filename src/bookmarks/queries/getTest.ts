import { Ctx } from "blitz"
import db from "db"

export default async function getTest(_ = null, { session }: Ctx) {
  return await db.test.findMany()
}
