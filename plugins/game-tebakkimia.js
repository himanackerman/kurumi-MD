import fs from 'fs'

let handler = async (m,{conn})=>{

conn.tebakkimia ||= {}

if(m.chat in conn.tebakkimia)
return conn.sendMessage(
m.chat,
{ text:'Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/tebakkimia.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.lambang.toLowerCase().trim()

conn.tebakkimia[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.tebakkimia[m.chat]){

conn.sendMessage(
m.chat,
{
text:`⏰ Waktu habis!\n\nJawaban:\n${json.lambang}`
},
{ quoted:global.fstatus }
)

delete conn.tebakkimia[m.chat]

}

},60000)
}

conn.sendMessage(
m.chat,
{
text:`⚗️ *TEBAK KIMIA*\n\n${json.unsur}\n\n⏱ Waktu: 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['tebakkimia']
handler.tags=['game']
handler.command=/^tebakkimia$/i

export default handler