let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const isEnable = /^(true|enable|(turn)?on|1)$/i.test(command)

  // ===== SAFE INIT =====
  if (!global.opts) global.opts = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  let user = global.db.data.users[m.sender]
  let settings = global.db.data.settings[conn.user.jid]

  let type = (args[0] || '').toLowerCase()
  let isAll = false
  let isUser = false

  switch (type) {
    case 'welcome':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.welcome = isEnable
      break

    case 'detect':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.detect = isEnable
      break

    case 'antidelete':
    case 'delete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.delete = isEnable
      break

    case 'autolevelup':
      isUser = true
      user.autolevelup = isEnable
      break

    case 'autoread':
      isAll = true
      if (!isOwner) return global.dfail('owner', m, conn)
      settings.autoread = isEnable
      break

    case 'public':
      isAll = true
      if (!isOwner) return global.dfail('owner', m, conn)
      settings.public = isEnable
      break

    case 'anticall':
      isAll = true
      if (!isOwner) return global.dfail('owner', m, conn)
      settings.anticall = isEnable
      break

    // ===== GLOBAL BOT MODE =====
    case 'pconly':
    case 'privateonly':
      isAll = true
      if (!isROwner && !isOwner) return global.dfail('owner', m, conn)
      global.opts.pconly = isEnable
      break

    case 'gconly':
    case 'grouponly':
      isAll = true
      if (!isROwner && !isOwner) return global.dfail('owner', m, conn)
      global.opts.gconly = isEnable
      break

    default:
      if (!/[01]/.test(command))
        return m.reply(
          `
*Daftar opsi yang bisa diatur:*

*Untuk User:*
- autolevelup

*Untuk Admin Grup:*
- welcome
- detect
- antidelete

*Untuk Owner Bot:*
- autoread
- public
- anticall
- pconly
- gconly

*Contoh penggunaan:*
- ${usedPrefix}enable welcome
- ${usedPrefix}disable welcome
`.trim()
        )
      throw false
  }

  m.reply(`*${type}* berhasil di *${isEnable ? 'aktifkan' : 'nonaktifkan'}* ${isAll ? 'untuk bot' : isUser ? '' : 'untuk chat ini'}`)
}

handler.help = ['enable', 'disable']
handler.tags = ['main']
handler.command = /^((en|dis)able|(true|false)|(turn)?(on|off)|[01])$/i

export default handler