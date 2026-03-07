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
  await m.react('✨')

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `ℹ️ Cara pakai:\nReply foto lalu ketik:\n${usedPrefix + command} Bahlil`
    }, { quoted: global.fkontak })
  }

  let q = m.quoted
  if (!q) {
    return conn.sendMessage(m.chat, {
      text: 'Reply fotonya dulu buat dijadiin avatar.'
    }, { quoted: global.fkontak })
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    return conn.sendMessage(m.chat, {
      text: 'Yang direply harus gambar.'
    }, { quoted: global.fkontak })
  }

  try {
    let buffer = await q.download()
    let avatarUrl = await uguu(buffer)

    await new Promise(r => setTimeout(r, 1200))

    const apiUrl = `https://api.apocalypse.web.id/canvas/fakeml?avatar=${encodeURIComponent(avatarUrl)}&nickname=${encodeURIComponent(text)}`

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: { Accept: 'image/*' },
      timeout: 20000
    })

    if (!res.headers['content-type']?.startsWith('image/')) throw 'invalid'

    await conn.sendMessage(m.chat, {
      image: res.data,
      caption: '✨ Done'
    }, { quoted: global.fkontak })

  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, {
      text: '❌ Yahh Error'
    }, { quoted: global.fkontak })
  }
}

handler.help = ['fakeml <teks> (reply foto)']
handler.tags = ['maker']
handler.command = /^fakeml$/i
handler.limit = true
handler.register = true

export default handler
