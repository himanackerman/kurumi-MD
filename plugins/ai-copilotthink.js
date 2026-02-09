import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return m.reply(`Contoh penggunaan:
${usedPrefix + command} Siapa presiden indonesia sekarang?`)
  }

  try {
    const url = `${global.APIs.deline}/ai/copilot-think?text=${encodeURIComponent(text)}`
    const { data } = await axios.get(url)

    if (!data.status) throw 'AI error'

    m.reply(data.result.text.trim())

  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil jawaban dari AI.')
  }
}

handler.help = ['copilotthink <pertanyaan>']
handler.tags = ['ai']
handler.command = /^copilotthink$/i
handler.limit = true

export default handler