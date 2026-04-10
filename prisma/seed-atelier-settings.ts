import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const settings = [
  { key: "atelier_overline", value: "Dans les coulisses" },
  { key: "atelier_title",    value: "L'atelier" },
  { key: "atelier_body",     value: "La Bande à Misa est un petit atelier où les tissus dansent et les idées fleurissent, inspirés par la vie, les saisons et les petites choses qui réchauffent le cœur.\n\nDans un coin de l'atelier, Lizzy, une petite Cavalier King Charles, observe, regarde et inspire quelques idées... ou quelques sourires.\n\nUn travail fait main offrant des prix justes et accessibles. Des créations uniques... et tout simplement irrésistibles !" },
  { key: "atelier_image1",   value: "/latelier/IMG_8566.JPG" },
  { key: "atelier_image2",   value: "/latelier/IMG_8548.JPG" },
  { key: "atelier_footer",   value: "Chaque pièce est unique — cousue à la main avec soin" },
]

async function main() {
  for (const { key, value } of settings) {
    const existing = await client.execute({ sql: `SELECT id FROM settings WHERE key = ?`, args: [key] })
    if (existing.rows.length > 0) {
      await client.execute({ sql: `UPDATE settings SET value = ?, updatedAt = datetime('now') WHERE key = ?`, args: [value, key] })
      console.log(`✓ Updated: ${key}`)
    } else {
      const id = `set_${Math.random().toString(36).slice(2, 10)}`
      await client.execute({
        sql: `INSERT INTO settings (id, key, value, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        args: [id, key, value],
      })
      console.log(`✓ Inserted: ${key}`)
    }
  }
  console.log("Done!")
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
