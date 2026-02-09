import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} https://youtu.be/uFaShu5UZcs`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/ytmp4?url=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let dl = json.result.download_url

    let videoRes = await fetch(dl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    let buffer = await videoRes.buffer()

    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        mimetype: 'video/mp4',
        caption: 'Done'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil video.', m)
  }
}

handler.help = ['ytmp4 <url>']
handler.tags = ['downloader']
handler.command = /^ytmp4$/i
handler.limit = true

export default handler
