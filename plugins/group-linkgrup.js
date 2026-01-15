let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di grup.")

  let code = await conn.groupInviteCode(m.chat)
  let gcLink = `https://chat.whatsapp.com/${code}`

  let text = `
*– 乂 LINK GRUP –*
${gcLink}

Gunakan link ini untuk mengundang member ke grup.
`.trim()

  await conn.reply(m.chat, text, m)
}

handler.help = ["linkgrup"]
handler.tags = ["group"]
handler.command = /^linkgrup$/i
handler.group = true
handler.botAdmin = true

export default handler