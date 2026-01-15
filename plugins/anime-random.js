import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://lance-frank-asta.onrender.com/api/anime-random')
    let data = await res.json()

    if (!data.status) throw `❌ Gagal ambil data anime.`

    let info = data.random
    let caption = `🎌 *Anime Random*

🆔 ID: ${info.ID}
👤 Nama: ${info.name}
🎬 Movie: ${info.movie}`

    await conn.sendFile(m.chat, info.imgAnime, 'anime.jpg', caption, m)
  } catch (e) {
    console.error(e)
    throw `❌ Error mengambil data Anime!`
  }
}

handler.help = ['animerandom']
handler.tags = ['anime']
handler.command = /^animerandom$/i
handler.limit = true

export default handler