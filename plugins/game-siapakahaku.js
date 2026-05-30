import fs from 'fs'

let handler = async (m,{conn})=>{

conn.siapakahaku ||= {}

if(m.chat in conn.siapakahaku)
return conn.sendMessage(
m.chat,
{ text:'Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/siapakahaku.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.jawaban.toLowerCase().trim()

conn.siapakahaku[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.siapakahaku[m.chat]){

conn.sendMessage(
m.chat,
{
text:`⏰ Waktu habis!\n\nJawaban:\n${json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.siapakahaku[m.chat]

}

},60000)
}

conn.sendMessage(
m.chat,
{
text:`🕵️ *SIAPAKAH AKU*\n\n${json.soal}\n\n⏱ Waktu: 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['siapakahaku']
handler.tags=['game']
handler.command=/^siapakahaku$/i


handler.all = async function(m){

if(!this.siapakahaku) return
if(!(m.chat in this.siapakahaku)) return
if(!m.text) return

let game=this.siapakahaku[m.chat]

let teks=m.text.toLowerCase().trim()

if(teks===game.jawaban){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{ text:'🎉 Benar!' },
{ quoted:global.fstatus }
)

delete this.siapakahaku[m.chat]

}

}

export default handler