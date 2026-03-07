import axios from 'axios'

let isSending = false

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} judul lagu`)
  if (isSending) return m.reply('otw...')

  isSending = true

  try {
    await m.react('🕒')

    const api = `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(api)

    if (!data?.status || !data?.result) throw 'Lagu tidak ditemukan.'

    const { title, thumbnail, dlink } = data.result
    if (!dlink) throw 'Link audio tidak tersedia.'

    const safeTitle = title.replace(/[^\w\s]/gi, '')

    await conn.sendMessage(m.chat, {
      audio: { url: dlink },
      mimetype: 'audio/mp4',
      fileName: `${safeTitle}.mp3`,
      contextInfo: {
        externalAdReply: {
          title,
          body: '✨ Audio Download',
          thumbnailUrl: thumbnail ? thumbnail.replace('default.jpg','hqdefault.jpg') : undefined,
          sourceUrl: 'https://youtube.com',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal mengambil audio.')
  } finally {
    isSending = false
  }
}

handler.help = ['play <judul lagu>']
handler.tags = ['downloader']
handler.command = /^play$/i
handler.limit = true

export default handler
