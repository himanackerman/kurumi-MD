import fs from 'fs'

let handler = async (m,{conn})=>{

conn.tebaklogo ||= {}

if(m.chat in conn.tebaklogo)
return conn.sendMessage(
m.chat,
{ text:'❀ Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/tebaklogo.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = json.jawaban.toLowerCase().trim()

conn.tebaklogo[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.tebaklogo[m.chat]){

conn.sendMessage(
m.chat,
{
text:`❀ Waktu habis!

🏷 Game : *Tebak Logo*

Jawaban :
${json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.tebaklogo[m.chat]

}

},60000)
}

await conn.sendMessage(
m.chat,
{
image:{url:json.img},
caption:`🏷 「 *TEBAK LOGO* 」

Tebak logo berikut

Waktu : 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['tebaklogo']
handler.tags=['game']
handler.command=/^tebaklogo$/i


handler.all = async function(m){

if(!this.tebaklogo) return
if(!(m.chat in this.tebaklogo)) return
if(!m.text) return

let game=this.tebaklogo[m.chat]

let teks=m.text.toLowerCase().trim()

if(teks==='nyerah'){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{
text:`🏳️ Menyerah!

🏷 Game : *Tebak Logo*

Jawaban :
${game.jawaban}`
},
{ quoted:global.fstatus }
)

delete this.tebaklogo[m.chat]
return
}

if(teks.replace(/\s/g,'')===game.jawaban.replace(/\s/g,'')){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{
text:`✨ Benar!

🏷 Game : *Tebak Logo*`
},
{ quoted:global.fstatus }
)

delete this.tebaklogo[m.chat]

}

}

export default handler