import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Ambil quoted atau pesan sendiri
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    // Prompt edit
    let prompt = (text || '').trim()
    if (!prompt) prompt = 'Edit karakter ini jadi tersenyum'

    let imageUrl = null

    // Jika user reply foto
    if (/image/.test(mime)) {
      let media = await q.download()
      if (!media) throw 'Gagal mengunduh media!'

      let form = new FormData()
      form.append('files[]', media, { filename: 'upload.' + mime.split('/')[1] })

      let upload = await axios.post('https://uguu.se/upload.php', form, {
        headers: form.getHeaders()
      })

      imageUrl = upload?.data?.files?.[0]?.url
      if (!imageUrl) throw 'Gagal upload ke Uguu!'
    } else {
      // Cek kalau user kirim URL gambar di text
      let urlMatch = (text || '').match(/https?:\/\/\S+/)
      if (urlMatch) {
        imageUrl = urlMatch[0]
        // Hapus URL dari prompt, sisain kata-kata edit
        prompt = text.replace(imageUrl, '').trim() || prompt
      }
    }

    if (!imageUrl) {
      throw `Kirim / reply foto yang mau diedit dengan caption:\n` +
            `${usedPrefix + command} <prompt>\n\n` +
            `Contoh:\n${usedPrefix + command} Edit karakter ini jadi tersenyum`
    }

    await m.reply('Tunggu sebentar, sedang mengedit foto...')

    // Panggil API Faa edit foto
    let apiUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`
    let res = await axios.get(apiUrl, {
      responseType: 'arraybuffer' // asumsi balasan berupa gambar
    })

    if (!res.data) throw 'Gagal mengedit foto!'

    await conn.sendFile(
      m.chat,
      res.data,
      'edit.jpg',
      `Selesai mengedit foto ✨`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply(typeof e === 'string' ? e : 'Terjadi error, coba lagi nanti.')
  }
}

handler.help = ['editimg <prompt> (reply foto)']
handler.tags = ['ai', 'tools']
handler.command = /^editimg$/i
handler.limit = true

export default handler