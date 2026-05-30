import fs from 'fs'

let handler = async (m,{conn})=>{

conn.susunkata ||= {}

if(m.chat in conn.susunkata)
return conn.sendMessage(
m.chat,
{ text:'Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/susunkata.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.jawaban.toLowerCase().trim()

conn.susunkata[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.susunkata[m.chat]){

conn.sendMessage(
m.chat,
{
text:`⏰ Waktu habis!\n\nJawaban:\n${json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.susunkata[m.chat]

}

},60000)
}

conn.sendMessage(
m.chat,
{
text:`🧩 *SUSUN KATA*\n\n${json.soal}\n\n⏱ Waktu: 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['susunkata']
handler.tags=['game']
handler.command=/^susunkata$/i


handler.all = async function(m){

if(!this.susunkata) return
if(!(m.chat in this.susunkata)) return
if(!m.text) return

let game=this.susunkata[m.chat]

let teks=m.text.toLowerCase().trim()

if(teks===game.jawaban){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{ text:'🎉 Benar!' },
{ quoted:global.fstatus }
)

delete this.susunkata[m.chat]

}

}

export default handler