/**
 * Pinterest Search
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API : https://api.nexray.eu.cc
 */

async function pinterestApi(query) {
  try {
    let res = await fetch(
      `https://api.nexray.eu.cc/search/pinterest?q=${encodeURIComponent(query)}`
    )

    let data = await res.json()

    if (!data?.status) return []

    return data.result
      .map((v, i) => ({
        title: v.grid_title || `Gambar ${i + 1}`,
        image: v.images_url
      }))
      .filter(v => v.image)

  } catch (e) {
    console.log('Pinterest Error:', e)
    return []
  }
}

let handler = async (m, { conn, text }) => {

  if (!text) {
    return m.reply('✨ Mau cari apa di Pinterest?')
  }

  try {

    let results = await pinterestApi(text)

    if (!results.length) {
      return m.reply('❌ Tidak ada hasil ditemukan')
    }

    let album = results.slice(0, 10).map(v => ({
      image: {
        url: v.image
      },

      caption:
`— pinterest search —

❀ title :
${v.title}

❀ image :
${v.image}`
    }))

    await conn.sendMessage(m.chat, {
      album
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal mengambil hasil Pinterest.')
  }
}

handler.command = /^(pinterest|pin)$/i
handler.help = ['pinterest <query>']
handler.tags = ['internet']
handler.register = true
handler.limit = true

export default handler