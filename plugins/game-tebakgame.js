import fs from 'fs'

let handler = async (m, { conn }) => {

  conn.game ||= {}

  let id = 'tebakgame-' + m.chat
  if (id in conn.game) {
    return conn.sendMessage(
      m.chat,
      { text: 'Masih ada game yang belum selesai' },
      { quoted: global.fstatus }
    )
  }

  let data = JSON.parse(fs.readFileSync('./json/tebakgame.json'))
  let json = data[Math.floor(Math.random() * data.length)]

  conn.game[id] = {
    jawaban: json.jawaban.toLowerCase().trim(),
    timeout: setTimeout(() => {
      if (conn.game[id]) {
        conn.sendMessage(
          m.chat,
          {
            text: `⏰ Waktu habis!\n\n🎮 Game : Tebak Game\n\nJawaban:\n${json.jawaban}`
          },
          { quoted: global.fstatus }
        )
        delete conn.game[id]
      }
    }, 60000)
  }

  await conn.sendMessage(
    m.chat,
    {
      image: { url: json.img },
      caption: `🎮 *TEBAK GAME*\n\nTebak nama game dari gambar ini\n\n⏱ Waktu : 60 detik`
    },
    { quoted: global.fstatus }
  )
}

handler.help = ['tebakgame']
handler.tags = ['game']
handler.command = /^tebakgame$/i

handler.before = async function (m) {
  this.game ||= {}
  let id = 'tebakgame-' + m.chat
  if (!(id in this.game)) return
  if (!m.text) return

  let room = this.game[id]
  let teks = m.text.toLowerCase().trim()

  if (teks === room.jawaban) {
    clearTimeout(room.timeout)

    await this.sendMessage(
      m.chat,
      { text: `✨ Benar!\n\n🎮 Game : Tebak Game` },
      { quoted: global.fstatus }
    )

    delete this.game[id]
    return true
  }
}

export default handler