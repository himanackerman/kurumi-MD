import fs from 'fs'

let handler = async (m,{conn})=>{

conn.tebaktebakan ||= {}

if(m.chat in conn.tebaktebakan)
return conn.sendMessage(
m.chat,
{ text:'Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/tebaktebakan.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.jawaban.toLowerCase().trim()

conn.tebaktebakan[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.tebaktebakan[m.chat]){

conn.sendMessage(
m.chat,
{
text:`⏰ Waktu habis!\n\nJawaban:\n${json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.tebaktebakan[m.chat]

}

},60000)
}

conn.sendMessage(
m.chat,
{
text:`❓ *TEBAK TEBAKAN*\n\n${json.soal}\n\n⏱ Waktu: 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['tebaktebakan']
handler.tags=['game']
handler.command=/^tebaktebakan$/i


handler.all = async function(m){

if(!this.tebaktebakan) return
if(!(m.chat in this.tebaktebakan)) return
if(!m.text) return

let game=this.tebaktebakan[m.chat]

let teks=m.text.toLowerCase().trim()

if(teks===game.jawaban){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{ text:'🎉 Benar!' },
{ quoted:global.fstatus }
)

delete this.tebaktebakan[m.chat]

}

}

export default handler