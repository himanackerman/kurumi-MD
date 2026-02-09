import axios from 'axios'

let handler = async (m, { conn }) => {
  await m.react('✨')

  try {
    const { data } = await axios.get(
      `${global.APIs.deline}/berita/cnbc`
    )

    if (!data.status || !data.data.length) {
      throw 'Berita tidak ditemukan'
    }

    const list = data.data.slice(0, 10)

    let caption = `✨ *Berita Terbaru CNBC Indonesia*\n\n`

    for (let i = 0; i < list.length; i++) {
      let berita = list[i]
      caption += `${i + 1}. *${berita.title}*\n`
      caption += `🗂️ ${berita.category || '-'}\n`
      caption += `🔗 ${berita.link}\n\n`
    }

    m.reply(caption.trim())

  } catch {
    m.reply('Gagal mengambil berita CNBC.')
  }
}

handler.help = ['cnbc']
handler.tags = ['internet']
handler.command = /^cnbc$/i
handler.limit = true

export default handler