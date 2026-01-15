/**
 *
 * Convert text to file
 * Sumber: https://whatsapp.com/channel/0029VbBoflt4dTnNWXV4zC09
 * Creator: jarr
 *
 * #no delete!
 *
 */

import fs from "fs"
import path from "path"

const BASE_DIR = path.join(process.cwd(), "data", "tofile")
if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true })

const MIME_MAP = {
  js: "application/javascript",
  mjs: "application/javascript",
  cjs: "application/javascript",
  ts: "application/typescript",

  json: "application/json",
  yml: "text/yaml",
  yaml: "text/yaml",
  env: "text/plain",

  txt: "text/plain",
  md: "text/markdown",
  log: "text/plain",
  csv: "text/csv",

  html: "text/html",
  css: "text/css",
  xml: "application/xml",
  sql: "application/sql",

  db: "application/octet-stream",
  sqlite: "application/octet-stream",
  sqlite3: "application/octet-stream",
  bin: "application/octet-stream",
  dat: "application/octet-stream",

  pdf: "application/pdf"
}

let handler = async (m, { conn, text, usedPrefix, command, isBan }) => {
  if (isBan) return

  if (!m.quoted)
    return m.reply(
      `Contoh:\n${usedPrefix + command} namafile.js (reply teks / dokumen)\n\n` +
      `Format didukung:\n` +
      Object.keys(MIME_MAP).join(", ")
    )

  if (!text)
    return m.reply("❌ Nama file wajib diisi")

  const fileName = text.trim()
  const ext = fileName.split(".").pop().toLowerCase()

  const mime = MIME_MAP[ext]
  if (!mime)
    return m.reply(
      `❌ Ekstensi .${ext} tidak didukung\n\n` +
      `Gunakan salah satu:\n${Object.keys(MIME_MAP).join(", ")}`
    )

  const filePath = path.join(BASE_DIR, fileName)

  try {
    if (m.quoted.text) {
      fs.writeFileSync(filePath, m.quoted.text)
    } else if (m.quoted.message?.documentMessage) {
      const buffer = await m.quoted.download()
      fs.writeFileSync(filePath, buffer)
    } else {
      return m.reply("❌ Reply harus berupa teks atau dokumen")
    }

    await conn.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(filePath),
        fileName,
        mimetype: mime,
        caption: "✅ Success convert *tofile!*"
      },
      { quoted: m }
    )

    fs.unlinkSync(filePath)
  } catch (e) {
    console.error(e)
    m.reply("⚠️ Gagal membuat file")
  }
}

handler.help = ["tofile <namafile.ext>"]
handler.tags = ["tools"]
handler.command = /^tofile$/i
handler.limit = true

export default handler