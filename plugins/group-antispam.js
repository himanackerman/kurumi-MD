const spamData = new Map()

let handler = async (m, { args }) => {
  let o = args[0] || ""

  if (!["--on", "--off"].includes(o))
    return m.reply("⚠️ Pilih opsi:\n\n• --on\n• --off")

  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = { antispam: false }
  }

  switch (o) {
    case "--on":
      db.data.chats[m.chat].antispam = true
      m.reply("✅ Anti Spam berhasil diaktifkan")
      break

    case "--off":
      db.data.chats[m.chat].antispam = false
      m.reply("❌ Anti Spam berhasil dinonaktifkan")
      break
  }
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  const chat = db?.data?.chats?.[m.chat]
  if (!chat?.antispam) return
  if (isAdmin) return

  const now = Date.now()
  const key = `${m.chat}:${m.sender}`

  let data = spamData.get(key) || { count: 0, last: 0 }

  if (now - data.last < 3000) {
    data.count++
  } else {
    data.count = 1
  }

  data.last = now
  spamData.set(key, data)

  if (data.count < 5) return

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
      `*– 乂 Anti Spam –*\nTerlalu banyak mengirim pesan dalam waktu singkat.`,
      m
    )

    data.count = 0
    spamData.set(key, data)
  } catch (e) {
    console.error("AntiSpam error:", e)
  }
}

handler.help = ["antispam --on", "antispam --off"]
handler.tags = ["group"]
handler.command = /^antispam$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler