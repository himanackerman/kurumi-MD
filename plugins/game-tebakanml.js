import fs from 'fs'

let handler = async (m,{conn})=>{

conn.tebakanml ||= {}

if(m.chat in conn.tebakanml)
return conn.sendMessage(
m.chat,
{ text:'Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/tebakanml.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.jawaban
.toLowerCase()
.replace(/\s+/g,' ')
.trim()

conn.tebakanml[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.tebakanml[m.chat]){

conn.sendMessage(
m.chat,
{
text:`⏰ Waktu habis!

🎮 Game : Tebakan ML

Jawaban :
${json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.tebakanml[m.chat]

}

},60000)
}

conn.sendMessage(
m.chat,
{
text:`🎮 *TEBAKAN ML*

${json.soal}

⏱ Waktu : 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['tebakanml']
handler.tags=['game']
handler.command=/^tebakanml$/i


handler.all = async function(m){

if(!this.tebakanml) return
if(!(m.chat in this.tebakanml)) return
if(!m.text) return

let game=this.tebakanml[m.chat]

let teks=m.text
.toLowerCase()
.replace(/\s+/g,' ')
.trim()

if(teks===game.jawaban){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{
text:`✨ Benar!

🎮 Game : Tebakan ML`
},
{ quoted:global.fstatus }
)

delete this.tebakanml[m.chat]

}

}

export default handler