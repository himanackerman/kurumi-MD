import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return m.reply(`Contoh penggunaan:
${usedPrefix + command} kinemaster`)
  }

  try {
    const url = `${global.APIs.deline}/search/playstore?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(url)

    if (!data.status || !data.result.length) {
      throw 'Aplikasi tidak ditemukan'
    }

    const list = data.result.slice(0, 5)

    let caption = `📲 *Play Store Search*\n\n`

    for (let i = 0; i < list.length; i++) {
      let v = list[i]
      caption += `${i + 1}. *${v.nama}*\n`
      caption += `👨‍💻 Developer: ${v.developer}\n`
      caption += `⭐ Rating: ${v.rate2}\n`
      caption += `🔗 App: ${v.link}\n`
      caption += `🏢 Dev Page: ${v.link_dev}\n\n`
    }

    m.reply(caption.trim())

  } catch (e) {
    console.error(e)
    m.reply('Gagal mencari di Play Store.')
  }
}

handler.help = ['playstoresearch <query>']
handler.tags = ['search']
handler.command = /^playstoresearch$/i
handler.limit = true

export default handler