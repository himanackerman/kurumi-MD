import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return m.reply(`Contoh penggunaan:
${usedPrefix + command} ML indonesia`)
  }

  try {
    const url = `${global.APIs.deline}/search/grubwa?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(url)

    if (!data.status || !data.result.length) {
      throw 'Grup tidak ditemukan'
    }

    let caption = `👥 *WhatsApp Group Search*\n\n`

    for (let i = 0; i < data.result.length; i++) {
      let v = data.result[i]
      caption += `${i + 1}. *${v.Name}*\n`
      caption += `📝 ${v.Description}\n`
      caption += `🔗 ${v.Link}\n\n`
    }

    m.reply(caption.trim())

  } catch (e) {
    console.error(e)
    m.reply('Gagal mencari grup WhatsApp.')
  }
}

handler.help = ['grupwasearch <query>']
handler.tags = ['search']
handler.command = /^grupwasearch$/i
handler.limit = true

export default handler