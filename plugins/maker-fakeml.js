import axios from 'axios'
import FormData from 'form-data'

async function uguu(buffer) {
  const form = new FormData()
  form.append('files[]', buffer, 'avatar.jpg')

  const { data } = await axios.post('https://uguu.se/upload', form, {
    headers: form.getHeaders()
  })

  return data.files[0].url
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Cara pakai:\nReply foto lalu ketik:\n${usedPrefix + command} Nickname`)
  }

  let q = m.quoted
  if (!q) {
    return m.reply('Reply fotonya dulu buat dijadiin avatar.')
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    return m.reply('Yang direply harus gambar.')
  }

  try {
    let buffer = await q.download()
    let avatarUrl = await uguu(buffer)

    const apiUrl = `https://api.nexray.web.id/maker/fakelobyml?avatar=${encodeURIComponent(avatarUrl)}&nickname=${encodeURIComponent(text)}`

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: { Accept: 'image/*' },
      timeout: 20000
    })

    if (!res.headers['content-type']?.startsWith('image/')) throw 'invalid'

    await conn.sendMessage(m.chat, {
      image: res.data,
      caption: 'Done'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Error')
  }
}

handler.help = ['fakeml']
handler.tags = ['maker']
handler.command = /^fakeml$/i
handler.limit = true
handler.register = true

export default handler