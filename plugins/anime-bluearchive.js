import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  await conn.reply(m.chat, global.wait, m)

  try {
    let res = await fetch('https://raw.githubusercontent.com/rynxzyy/blue-archive-r-img/refs/heads/main/links.json')
    if (!res.ok) throw await res.text()

    let data = await res.json()
    if (!Array.isArray(data) || data.length === 0) throw 'Gambar tidak ditemukan'

    let img = data[Math.floor(Math.random() * data.length)]

    await conn.sendFile(m.chat, img, 'blue-archive.jpg', '✨ _Random Blue Archive_', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan: ' + e)
  }
}

handler.help = ['bluearchive']
handler.tags = ['anime']
handler.command = /^bluearchive|baimg|blue-archive$/i
handler.limit = false

export default handler