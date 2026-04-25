import "dotenv/config"
import { defineConfig } from "drizzle-kit"

const url =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ""

if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED or DATABASE_URL must be set to run drizzle-kit",
  )
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
})
