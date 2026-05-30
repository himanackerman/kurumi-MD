import fs from 'fs'

let handler = async (m,{conn})=>{

conn.tebakbendera ||= {}

if(m.chat in conn.tebakbendera)
return conn.sendMessage(
m.chat,
{ text:'❀ Masih ada game yang belum selesai' },
{ quoted:global.fstatus }
)

let data = JSON.parse(fs.readFileSync('./json/tebakbendera.json'))
let json = data[Math.floor(Math.random()*data.length)]

let jawaban = (json.name || json.jawaban).toLowerCase().trim()

conn.tebakbendera[m.chat] = {
jawaban,
timeout:setTimeout(()=>{

if(conn.tebakbendera[m.chat]){

conn.sendMessage(
m.chat,
{
text:`❀ Waktu habis!

🚩 Game : *Tebak Bendera*

Jawaban :
${json.name || json.jawaban}`
},
{ quoted:global.fstatus }
)

delete conn.tebakbendera[m.chat]

}

},60000)
}

await conn.sendMessage(
m.chat,
{
image:{url:json.img},
caption:`🚩 「 *TEBAK BENDERA* 」

Tebak negara dari bendera ini

Waktu : 60 detik`
},
{ quoted:global.fstatus }
)

}

handler.help=['tebakbendera']
handler.tags=['game']
handler.command=/^tebakbendera$/i


handler.all = async function(m){

if(!this.tebakbendera) return
if(!(m.chat in this.tebakbendera)) return
if(!m.text) return

let game=this.tebakbendera[m.chat]

let teks=m.text.toLowerCase().trim()

if(teks==='nyerah'){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{
text:`🏳️ Menyerah!

🚩 Game : *Tebak Bendera*

Jawaban :
${game.jawaban}`
},
{ quoted:global.fstatus }
)

delete this.tebakbendera[m.chat]
return
}

if(teks.replace(/\s/g,'')===game.jawaban.replace(/\s/g,'')){

clearTimeout(game.timeout)

await this.sendMessage(
m.chat,
{
text:`✨ Benar!

🚩 Game : *Tebak Bendera*`
},
{ quoted:global.fstatus }
)

delete this.tebakbendera[m.chat]

}

}

export default handler