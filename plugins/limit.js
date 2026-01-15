let handler = async (m, { conn }) => {
  let who = m.isGroup
    ? (m.mentionedJid[0] ? m.mentionedJid[0] : m.sender)
    : m.sender

  if (typeof global.db.data.users[who] == 'undefined')
    throw '❌ User tidak ditemukan'

  let user = global.db.data.users[who]
  let limit = user.premiumTime >= 1 ? '∞ Unlimited' : user.limit

  const isDeveloper = global.owner?.some(v => {
    if (Array.isArray(v)) return who.includes(v[0])
    return who.includes(v)
  })

  let status =
    isDeveloper
      ? '✨ Developer'
      : user.premiumTime >= 1
      ? '🌸 Premium'
      : user.level >= 1000
      ? '🔥 Elite'
      : '🌱 Free User'

  let text = `✨ *INFO LIMIT* 

👤 *Username* : ${user.registered ? user.name : conn.getName(who)}
🏮 *Status*   : ${status}
🎟️ *Limit*    : ${limit}
`.trim()

  conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['limit [@user]']
handler.tags = ['main']
handler.command = /^(limit)$/i
export default handler