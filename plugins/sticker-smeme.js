import { Sticker } from 'wa-sticker-formatter'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

async function uguu(filePath) {
  const form = new FormData()
  form.append('files[]', fs.createReadStream(filePath))
  const { data } = await axios.post('https://uguu.se/upload', form, {
    headers: { ...form.getHeaders() }
  })
  return data.files[0].url
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  let q = m.quoted ? m.quoted : m

  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} teks atas|teks bawah`)
  }

  let [atas, bawah] = text.split('|')
  atas = atas || ' '
  bawah = bawah || ' '

  let buffer
  try {
    buffer = await q.download()
  } catch (e) {
    return m.reply(`Balas gambar dengan caption:\n${usedPrefix + command} teks atas|teks bawah`)
  }

  await m.react('✨')

  let mime = (q.msg || q).mimetype || 'image/png'
  let ext = mime.split('/')[1] || 'png'
  let tempFile = path.join(process.cwd(), `smeme_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, buffer)

  try {
    let url = await uguu(tempFile)

    let memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${url}`

    let stiker = await createSticker(memeUrl)

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat meme sticker')
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
  }
}

handler.help = ['smeme <teks atas>|teks bawah>']
handler.tags = ['sticker']
handler.command = /^smeme$/i
handler.limit = true

export default handler

async function createSticker(img, quality = 100) {
  let stickerMetadata = {
    type: 'full',
    pack: 'Sticker',
    author: 'ᴋᴜʀᴜᴍɪ ᴍᴅ ʙy ʜɪʟᴍᴀɴ',
    quality
  }
  return new Sticker(img, stickerMetadata).toBuffer()
}