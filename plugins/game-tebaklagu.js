import fs from 'fs'

let timeout = 60000
let poin = 50

let handler = async (m, { conn }) => {

conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}

let id = m.chat

if (id in conn.tebaklagu)
return conn.reply(
m.chat,
'❀ Masih ada game yang belum selesai',
conn.tebaklagu[id][0]
)

let src = JSON.parse(fs.readFileSync('./json/tebaklagu.json'))
let json = src[Math.floor(Math.random()*src.length)]

let caption = `
🎵 「 *TEBAK LAGU* 」

Tebak judul lagu dari audio ini

Waktu : ${timeout/1000} detik
Bonus : ${poin} XP
`.trim()

conn.tebaklagu[id] = [

await conn.sendMessage(
m.chat,
{
audio:{ url: json.lagu },
mimetype:'audio/mp4'
},
{ quoted: global.fstatus }
),

json,
poin,

setTimeout(async () => {

if (conn.tebaklagu[id]) {

await conn.reply(
m.chat,
`❀ Waktu habis!

🎵 Game : Tebak Lagu

Jawaban :
${json.judul}
Artis : ${json.artis}`,
global.fstatus
)

delete conn.tebaklagu[id]

}

}, timeout)

]

await conn.reply(m.chat, caption, global.fstatus)

}

handler.help = ['tebaklagu']
handler.tags = ['game']
handler.command = /^tebaklagu$/i
handler.register = true


handler.all = async function (m) {

if (!this.tebaklagu) return
if (!(m.chat in this.tebaklagu)) return
if (!m.text) return

let room = this.tebaklagu[m.chat]
let json = room[1]

let jawaban = json.judul.toLowerCase().trim()

let teks = m.text.toLowerCase().trim()

if (teks === 'nyerah') {

clearTimeout(room[3])

await this.reply(
m.chat,
`🏳️ Menyerah!

🎵 Game : Tebak Lagu

Jawaban :
${json.judul}
Artis : ${json.artis}`,
global.fstatus
)

delete this.tebaklagu[m.chat]
return
}

if (teks.replace(/\s/g,'') === jawaban.replace(/\s/g,'')) {

clearTimeout(room[3])

await this.reply(
m.chat,
`✨ Benar!

🎵 Game : Tebak Lagu
Artis : ${json.artis}

+${room[2]} XP`,
global.fstatus
)

delete this.tebaklagu[m.chat]

}

}

export default handler