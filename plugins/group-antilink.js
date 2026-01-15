let handler = async (m, { conn, args }) => {
  let o = args[0] || ""

  if (!["--on", "--off"].includes(o))
    return m.reply("⚠️ Pilih opsi:\n\n• --on\n• --off")

  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = { antilink: false }
  }

  switch (o) {
    case "--on":
      db.data.chats[m.chat].antilink = true
      m.reply("✅ Anti Link Grup berhasil diaktifkan")
      break

    case "--off":
      db.data.chats[m.chat].antilink = false
      m.reply("❌ Anti Link Grup berhasil dinonaktifkan")
      break
  }
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!m.text) return
  if (!isBotAdmin) return

  const chat = db?.data?.chats?.[m.chat]
  if (!chat?.antilink) return
  if (isAdmin) return

  const linkRegex = /(chat\.whatsapp\.com\/|wa\.me\/chat)/i
  if (!linkRegex.test(m.text)) return

  try {
    const groupInvite = await conn.groupInviteCode(m.chat)
    const ownLink = `https://chat.whatsapp.com/${groupInvite}`

    if (m.text.includes(ownLink)) return

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
      `*– 乂 Anti Link Grup –*\nLink grup WhatsApp tidak diperbolehkan di sini!`,
      m
    )
  } catch (e) {
    console.error("Antilink error:", e)
  }
}

handler.help = ["antilink --on", "antilink --off"]
handler.tags = ["group"]
handler.command = /^antilink$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler