import fs from 'fs'

let handler = async (m,{conn})=>{

conn.tebaklirik ||= {}

if(m.chat in conn.tebaklirik)
return conn.sendMessage(
m.chat,
{ text:'Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/tebaklirik.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.jawaban.toLowerCase().trim()

conn.tebaklirik[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.tebaklirik[m.chat]){

conn.sendMessage(
m.chat,
{
text:`⏰ Waktu habis!\n\nJawaban:\n${json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.tebaklirik[m.chat]

}

},60000)
}

conn.sendMessage(
m.chat,
{
text:`🎵 *TEBAK LIRIK*\n\n${json.soal}\n\n⏱ Waktu: 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['tebaklirik']
handler.tags=['game']
handler.command=/^tebaklirik$/i

export default handler