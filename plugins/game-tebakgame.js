import fetch from 'node-fetch'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
let imgr = flaaa.getRandom()

    conn.tebakgames = conn.tebakgames ? conn.tebakgames : {}
    let id = m.chat
    if (id in conn.tebakgames) {
        conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakgames[id][0])
        throw false
    }
    let src = await (await fetch('https://raw.githubusercontent.com/qisyana/scrape/main/tebakgame.json')).json()
    let json = src[Math.floor(Math.random() * src.length)]
  let caption = `*${command.toUpperCase()}*
Logo apakah ini?

Timeout *${(timeout / 1000).toFixed(2)} detik*
gunakan ${usedPrefix}hgame untuk bantuan
Bonus: ${poin} XP
    `.trim()
    conn.tebakgames[id] = [
        await conn.sendFile(m.chat, json.img, null, caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.tebakgames[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakgames[id][0])
            delete conn.tebakgames[id]
        }, timeout)
    ]
}
handler.help = ['tebakgame']
handler.tags = ['game']
handler.command = /^tebakgame/i

export default handler