/**
 * Spotify Search
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API : https://api.nexray.eu.cc
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan judul lagu\n\nContoh:\n${usedPrefix + command} swim chase atlantic`

  try {
    let res = await fetch(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(text)}`)
    let data = await res.json()

    if (!data.status || !data.result.length) {
      throw 'Lagu tidak ditemukan'
    }

    let result = data.result.slice(0, 10)

    let caption = `— spotify search —\n\n`

    for (let i = 0; i < result.length; i++) {
      let v = result[i]

      caption += `❀ title :\n${v.title}\n\n`
      caption += `❀ artist : ${v.artist}\n`
      caption += `❀ album : ${v.album}\n`
      caption += `❀ duration : ${v.duration}\n`
      caption += `❀ popularity : ${v.popularity}\n`
      caption += `❀ release : ${v.release_date}\n`
      caption += `❀ url : ${v.url}\n`

      if (i !== result.length - 1) {
        caption += `\n──────────────────\n\n`
      }
    }

    await conn.sendMessage(m.chat, {
      image: { url: result[0].thumbnail },
      caption
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    throw 'Terjadi kesalahan saat mencari lagu'
  }
}

handler.help = ['spotifysearch']
handler.tags = ['search']
handler.command = /^(spotifysearch|spotifys|sps)$/i
handler.limit = true
handler.register = true

export default handler