let handler = async (m, { args }) => {
  let o = args[0] || ""

  if (!["--on", "--off"].includes(o))
    return m.reply("⚠️ Pilih opsi:\n\n• --on\n• --off")

  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = { antivirtex: false }
  }

  switch (o) {
    case "--on":
      db.data.chats[m.chat].antivirtex = true
      m.reply("✅ Anti Virtex berhasil diaktifkan")
      break

    case "--off":
      db.data.chats[m.chat].antivirtex = false
      m.reply("❌ Anti Virtex berhasil dinonaktifkan")
      break
  }
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!m.text) return
  if (!isBotAdmin) return

  const chat = db?.data?.chats?.[m.chat]
  if (!chat?.antivirtex) return
  if (isAdmin) return

  const maxLength = 4000
  const repeatRegex = /(.)\1{15,}/g

  const isVirtex =
    m.text.length > maxLength ||
    repeatRegex.test(m.text)

  if (!isVirtex) return

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
      `*– 乂 Anti Virtex –*\nPesan terdeteksi sebagai spam / virtex dan telah dihapus.`,
      m
    )
  } catch (e) {
    console.error("AntiVirtex error:", e)
  }
}

handler.help = ["antivirtex --on", "antivirtex --off"]
handler.tags = ["group"]
handler.command = /^antivirtex$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler