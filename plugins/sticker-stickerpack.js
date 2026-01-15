import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

if (!global.getStickerSession) global.getStickerSession = {}

class StickerPack {
  async search(query) {
    const res = await axios.post(
      'https://getstickerpack.com/api/v1/stickerdb/search',
      { query, page: 1 }
    ).then(v => v.data)

    return res.data.map(v => ({
      name: v.title,
      slug: v.slug,
      download: v.download_counter
    }))
  }

  async detail(slug) {
    const res = await axios.get(
      `https://getstickerpack.com/api/v1/stickerdb/stickers/${slug}`
    ).then(v => v.data.data)

    return {
      title: res.title,
      stickers: res.images.map(v => ({
        image: `https://s3.getstickerpack.com/${v.url}`,
        animated: v.is_animated !== 0
      }))
    }
  }
}

const scraper = new StickerPack()

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args.length) {
    return m.reply(`Contoh:\n${usedPrefix + command} blue archive`)
  }

  const query = args.join(' ')
  const packs = await scraper.search(query)
  if (!packs.length) return m.reply('Sticker pack tidak ditemukan.')

  global.getStickerSession[m.sender] = packs.slice(0, 10)

  let teks = `✨ *HASIL STICKER PACK*\n\n`
  packs.slice(0, 10).forEach((p, i) => {
    teks += `${i + 1}. ${p.name}\n`
    teks += `• Download: ${p.download}\n\n`
  })
  teks += `Ketik *nomor saja* untuk memilih\nContoh: *1*`

  m.reply(teks.trim())
}

handler.before = async function (m, { conn }) {
  if (!/^(10|[1-9])$/.test(m.text)) return

  const session = global.getStickerSession?.[m.sender]
  if (!session) return

  const index = Number(m.text) - 1
  const pick = session[index]
  if (!pick) return m.reply('Nomor tidak valid.')

  delete global.getStickerSession[m.sender]

  m.reply(`Mengirim sticker dari *${pick.name}*...`)

  try {
    const res = await scraper.detail(pick.slug)
    if (!res.stickers.length) return m.reply('Sticker kosong.')

    const hasStatic = res.stickers.some(s => !s.animated)

    let sent = 0
    for (let s of res.stickers) {
      if (sent >= 10) break
      if (hasStatic && s.animated) continue

      try {
        const img = await axios.get(s.image, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(img.data)

        const sticker = await createSticker(buffer, {
          pack: 'ᴄʀᴇᴀᴛᴇᴅ',
          author: 'ᴋᴜʀᴜᴍɪ ᴍᴅ ʙy ʜɪʟᴍᴀɴ',
          type: s.animated ? StickerTypes.FULL : StickerTypes.DEFAULT
        })

        await conn.sendMessage(
          m.chat,
          { sticker },
          { quoted: m }
        )

        sent++
        await new Promise(r => setTimeout(r, 2000))
      } catch (e) {
        console.log(e)
      }
    }

    m.reply(`✔ Selesai, terkirim ${sent} sticker dari *${res.title}*`)
  } catch (e) {
    console.log(e)
    m.reply('Gagal mengambil sticker pack.')
  }
}

handler.help = ['stickerpack <query>']
handler.tags = ['sticker']
handler.command = /^stickerpack$/i
handler.limit = true

export default handler