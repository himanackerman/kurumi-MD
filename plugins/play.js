/*
/**
 * YouTube play 
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * source scrape : https://whatsapp.com/channel/0029VbCjWZcDOQIfSnwjbL25/148
 */
import { createDecipheriv } from 'crypto'
import yts from 'yt-search'

const METADATA_DECRYPTION_KEY = Buffer.from(
   'C5D58EF67A7584E4A29F6C35BBC4EB12',
   'hex'
)

const HEADERS = {
   'Content-Type': 'application/json',
   Origin: 'https://yt.savetube.me',
   'User-Agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
}

async function savetube(url, {
   downloadType = 'audio',
   quality = '128kbps'
} = {}) {

   const idMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
   )

   if (!idMatch) throw 'URL tidak valid'

   const videoId = idMatch[1]

   const cdn = await fetch(
      'https://media.savetube.vip/api/random-cdn',
      {
         headers: HEADERS
      }
   ).then(res => res.json())

   const info = await fetch(
      `https://${cdn.cdn}/v2/info`,
      {
         method: 'POST',
         headers: HEADERS,
         body: JSON.stringify({
            url: 'https://www.youtube.com/watch?v=' + videoId
         })
      }
   ).then(res => res.json())

   const encrypted = Buffer.from(info.data, 'base64')

   const decipher = createDecipheriv(
      'aes-128-cbc',
      METADATA_DECRYPTION_KEY,
      encrypted.subarray(0, 16)
   )

   const decrypted = Buffer.concat([
      decipher.update(encrypted.subarray(16)),
      decipher.final()
   ])

   const metadata = JSON.parse(
      decrypted.toString('utf8')
   )

   const dl = await fetch(
      `https://${cdn.cdn}/download`,
      {
         method: 'POST',
         headers: HEADERS,
         body: JSON.stringify({
            id: videoId,
            downloadType,
            quality,
            key: metadata.key
         })
      }
   ).then(res => res.json())

   if (!dl.data?.downloadUrl) {
      throw dl.message || 'Gagal ambil audio'
   }

   return {
      title: metadata.title,
      duration: metadata.durationLabel,
      thumbnail: metadata.thumbnail,
      url: dl.data.downloadUrl,
      size: dl.data.size || 0
   }
}

let handler = async (
   m,
   { conn, text, usedPrefix, command }
) => {

   if (!text) {
      throw `Contoh:\n${usedPrefix + command} chase atlantic`
   }

   await m.react('✨')

   let search = await yts(text)
   let vid = search.videos[0]

   if (!vid) throw 'Lagu tidak ditemukan'

   let caption = `
— youtube play —

❀ title :
${vid.title}

❀ author : ${vid.author.name}
❀ duration : ${vid.timestamp}

❀ views : ${vid.views.toLocaleString('id-ID')}
❀ upload : ${vid.ago}

❀ status : otw kirim audio...
`.trim()

   await conn.sendMessage(m.chat, {
      image: {
         url: vid.thumbnail
      },
      caption
   }, { quoted: m })

   let res = await savetube(
      vid.url,
      {
         downloadType: 'audio',
         quality: '128kbps'
      }
   )

   let sizeMB = Number(res.size) / 1024 / 1024

   if (sizeMB > 50) {

      await conn.sendMessage(m.chat, {
         document: {
            url: res.url
         },
         mimetype: 'audio/mpeg',
         fileName: res.title + '.mp3'
      }, { quoted: m })

   } else {

      await conn.sendMessage(m.chat, {
         audio: {
            url: res.url
         },
         mimetype: 'audio/mpeg',
         fileName: res.title + '.mp3'
      }, { quoted: m })

   }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = /^play$/i
handler.limit = true

export default handler
