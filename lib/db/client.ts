import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"

import * as schema from "./schema"

type Db = ReturnType<typeof drizzle<typeof schema>>

let cached: Db | null = null

function getDb(): Db {
  if (cached) return cached
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  // The neon-serverless driver uses WebSockets and supports interactive
  // transactions, which we need for the ingest endpoint's multi-statement
  // re-ingest path. In Node.js runtimes (Vercel functions) we need to provide
  // a `ws` implementation; on Edge or modern Node, the global `WebSocket` is
  // used automatically.
  if (typeof WebSocket === "undefined") {
    // Lazily require the `ws` package only when needed (Node < 22 / Vercel).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    neonConfig.webSocketConstructor = require("ws")
  }
  const pool = new Pool({ connectionString })
  cached = drizzle(pool, { schema })
  return cached
}

// Lazy proxy: defers reading DATABASE_URL until the first DB call. Lets
// `next build` import this module without env vars set, since all pages that
// touch the DB are `force-dynamic`.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
}) as Db

export { schema }
