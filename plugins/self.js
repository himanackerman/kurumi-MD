let handler = async (m, { command }) => {
  if (!global.db.data.settings) global.db.data.settings = {}
  if (!global.db.data.settings[m.conn.user.jid]) {
    global.db.data.settings[m.conn.user.jid] = { public: true }
  }

  let settings = global.db.data.settings[m.conn.user.jid]

  if (command === 'self') {
    if (!settings.public) return m.reply('Bot sudah mode SELF')
    settings.public = false
    return m.reply('✅ Bot masuk mode SELF')
  }

  if (command === 'public') {
    if (settings.public) return m.reply('Bot sudah mode PUBLIC')
    settings.public = true
    return m.reply('✅ Bot masuk mode PUBLIC')
  }
}

handler.help = ['self', 'public']
handler.tags = ['owner']
handler.command = /^(self|public)$/i
handler.owner = true

export default handler