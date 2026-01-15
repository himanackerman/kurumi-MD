let handler = async (m, { text }) => {
  let jumlah = parseInt(text)

  if (isNaN(jumlah) || jumlah < 0) {
    return m.reply(`❌ Masukkan angka limit!\n\nContoh:\n.resetlimit 10`)
  }

  let users = global.db.data.users
  let total = 0

  for (let jid in users) {
    let user = users[jid]
    if (!user) continue

    user.limit = jumlah
    total++
  }

  m.reply(
`✅ *RESET LIMIT GLOBAL BERHASIL*

👥 Total user : *${total} user*
🎯 Limit baru : *${jumlah}*`
  )
}

handler.help = ['resetlimit <jumlah>']
handler.tags = ['owner']
handler.command = /^resetlimit$/i
handler.owner = true

export default handler