const toxicWords = [
  "anjing",
  "babi",
  "bangsat",
  "kontol",
  "memek",
  "ngentot",
  "asu",
  "goblok",
  "tolol",
  "bajingan",
  "fuck",
  "shit",
  "bitch"
]

let handler = async (m, { args }) => {
  let o = args[0] || ""

  if (!["--on", "--off"].includes(o))
    return m.reply("⚠️ Pilih opsi:\n\n• --on\n• --off")

  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = { antitoxic: false }
  }

  switch (o) {
    case "--on":
      db.data.chats[m.chat].antitoxic = true
      m.reply("✅ Anti Toxic berhasil diaktifkan")
      break

    case "--off":
      db.data.chats[m.chat].antitoxic = false
      m.reply("❌ Anti Toxic berhasil dinonaktifkan")
      break
  }
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!m.text) return
  if (!isBotAdmin) return

  const chat = db?.data?.chats?.[m.chat]
  if (!chat?.antitoxic) return
  if (isAdmin) return

  const text = m.text.toLowerCase()
  const found = toxicWords.some(word => text.includes(word))
  if (!found) return

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    await conn.reply(
      m.chat,
      `*– 乂 Anti Toxic –*\nPesan mengandung kata tidak pantas dan telah dihapus.`,
      m
    )
  } catch (e) {
    console.error("AntiToxic error:", e)
  }
}

handler.help = ["antitoxic --on", "antitoxic --off"]
handler.tags = ["group"]
handler.command = /^antitoxic$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler