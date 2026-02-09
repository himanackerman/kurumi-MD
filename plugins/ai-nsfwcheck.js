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

let handler = async (m, { conn }) => {
  await m.react('✨')

  let q = m.quoted ? await m.getQuotedObj() : m

  if (q.mtype !== 'imageMessage') {
    return m.reply('Kirim atau reply gambar lalu ketik *.nsfwcheck*')
  }

  let buffer = await q.download()
  if (!buffer) return

  let tempFile = path.join(process.cwd(), `nsfw_${Date.now()}.jpg`)
  fs.writeFileSync(tempFile, buffer)

  try {
    let srcUrl = await uguu(tempFile)

    const { data } = await axios.get(
      `${global.APIs.deline}/ai/nsfwcheck?url=${encodeURIComponent(srcUrl)}`
    )

    let caption = `✨ *NSFW Check Result*\n\n`
    caption += `✨ Label : *${data.result.labelName}*\n`
    caption += `✨ Confidence : *${(data.result.confidence * 100).toFixed(2)}%*`

    m.reply(caption)
  } finally {
    fs.unlinkSync(tempFile)
  }
}

handler.help = ['nsfwcheck']
handler.tags = ['ai']
handler.command = /^nsfwcheck$/i
handler.limit = true

export default handler