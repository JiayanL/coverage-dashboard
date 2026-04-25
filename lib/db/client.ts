import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

type Db = ReturnType<typeof drizzle<typeof schema>>

let cached: Db | null = null

function getDb(): Db {
  if (cached) return cached
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  const sql = neon(connectionString)
  cached = drizzle(sql, { schema })
  return cached
}

// Lazy proxy: defers reading DATABASE_URL until the first DB call. This lets
// `next build` import this module without env vars set (e.g. on a fresh Vercel
// project), since all pages that touch the DB are `force-dynamic`.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
}) as Db

export { schema }
