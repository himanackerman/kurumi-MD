import fs from 'fs'

let handler = async (m, { conn }) => {

  conn.family100 ||= {}

  if (m.chat in conn.family100)
    return conn.sendMessage(
      m.chat,
      { text: 'Masih ada game yang belum selesai' },
      { quoted: global.fstatus }
    )

  let data = JSON.parse(fs.readFileSync('./json/family100.json'))
  let json = data[Math.floor(Math.random() * data.length)]

  let jawaban = [...new Set(json.jawaban.map(v =>
    v.toLowerCase().replace(/\s+/g, ' ').trim()
  ))]

  conn.family100[m.chat] = {
    soal: json.soal,
    jawaban,
    terjawab: new Array(jawaban.length).fill(false),
    timeout: setTimeout(() => {

      if (conn.family100[m.chat]) {

        conn.sendMessage(
          m.chat,
          {
            text: `⏰ Waktu habis!\n\nJawaban:\n${jawaban.join('\n')}`
          },
          { quoted: global.fstatus }
        )

        delete conn.family100[m.chat]

      }

    }, 60000)
  }

  conn.sendMessage(
    m.chat,
    {
      text: `🎮 *FAMILY100*\n\n${json.soal}\n\n${jawaban.map((_, i) => `${i + 1}. ❓`).join('\n')}\n\n⏱ Waktu: 60 detik`
    },
    { quoted: global.fstatus }
  )

}

handler.help = ['family100']
handler.tags = ['game']
handler.command = /^family100$/i


handler.all = async function (m) {

  if (!this.family100) return
  if (!(m.chat in this.family100)) return
  if (!m.text) return

  let game = this.family100[m.chat]

  let teks = m.text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  if (teks.includes('nyerah')) {

    clearTimeout(game.timeout)

    await this.sendMessage(
      m.chat,
      {
        text: `🏳️ Menyerah!\n\nJawaban:\n${game.jawaban.join('\n')}`
      },
      { quoted: global.fstatus }
    )

    delete this.family100[m.chat]
    return
  }

  let index = game.jawaban.findIndex(v => v === teks)

  if (index !== -1 && !game.terjawab[index]) {

    game.terjawab[index] = true

    let user = global.db.data.users[m.sender]
    if (!user.exp) user.exp = 0

    let exp = 40
    user.exp += exp

    let papan = game.jawaban.map((v, i) =>
      `${i + 1}. ${game.terjawab[i] ? v : '❓'}`
    ).join('\n')

    await this.sendMessage(
      m.chat,
      {
        text: `✅ Benar!\n\n${papan}\n\n+${exp} EXP`
      },
      { quoted: global.fstatus }
    )

    if (game.terjawab.every(v => v)) {

      clearTimeout(game.timeout)

      await this.sendMessage(
        m.chat,
        { text: '🎉 Semua jawaban ditemukan!' },
        { quoted: global.fstatus }
      )

      delete this.family100[m.chat]

    }

  }

}

export default handler