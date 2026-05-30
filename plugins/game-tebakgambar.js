import fs from 'fs'

let timeout = 60000
let poin = 40

let handler = async (m, { conn }) => {

conn.game = conn.game ? conn.game : {}

let id = 'tebakgambar-' + m.chat

if (id in conn.game)
return conn.reply(
m.chat,
'❀ Masih ada game yang belum selesai',
conn.game[id][0]
)

let src = JSON.parse(fs.readFileSync('./json/tebakgambar.json'))
let json = src[Math.floor(Math.random() * src.length)]

let caption = `
🖼 「 *TEBAK GAMBAR* 」

${json.deskripsi}

Waktu : ${timeout/1000} detik
Bonus : ${poin} XP
`.trim()

conn.game[id] = [
await conn.sendMessage(
m.chat,
{
image:{ url: json.img },
caption
},
{ quoted:m }
),
json,
poin,
setTimeout(()=>{
if(conn.game[id]){

conn.reply(
m.chat,
`❀ Waktu habis!

🖼 Game : Tebak Gambar

Jawaban :
${json.jawaban}`,
conn.game[id][0]
)

delete conn.game[id]

}
},timeout)
]

}

handler.help = ['tebakgambar']
handler.tags = ['game']
handler.command = /^tebakgambar$/i

handler.game = true


handler.all = async function (m){

if(!this.game) return

let id = 'tebakgambar-' + m.chat
if(!(id in this.game)) return
if(!m.text) return

let room = this.game[id]
let json = room[1]

let teks = m.text.toLowerCase().trim()

if (teks === 'nyerah') {

clearTimeout(room[3])

await this.reply(
m.chat,
`🏳️ Menyerah!

🖼 Game : Tebak Gambar

Jawaban :
${json.jawaban}`,
room[0]
)

delete this.game[id]
return
}

if (teks.replace(/\s/g,'') === json.jawaban.toLowerCase().replace(/\s/g,'')) {

clearTimeout(room[3])

let user = global.db.data.users[m.sender]
if(!user.exp) user.exp = 0

let exp = room[2]
user.exp += exp

await this.reply(
m.chat,
`✨ Benar!

🖼 Game : Tebak Gambar

+${exp} XP`,
room[0]
)

delete this.game[id]

}

}

export default handler