/* 
• Ytmp4 downloader 
• source : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
• source Scrape : https://whatsapp.com/channel/0029Vb7AafUL7UVRIpg1Fy24/152
*/

import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

const API_URL = "https://thesocialcat.com/api/youtube-download"
const HEADERS = {
  "accept": "*/*",
  "accept-language": "id-ID",
  "content-type": "application/json",
  "Referer": "https://thesocialcat.com/tools/youtube-video-downloader",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

const QUALITIES = ['144p','240p','360p','480p','720p','1080p']

async function ytdl(url, format) {
  const { data } = await axios.post(API_URL, { url, format }, { headers: HEADERS })
  if (!data || !data.mediaUrl) throw 'Gagal ambil link video'
  return data
}

let handler = async (m, { conn, text, args }) => {
  if (!text) return m.reply('Contoh:\n.ytmp4 720p https://youtu.be/xxxx')

  let quality = '720p'
  let url = text

  if (args[0] && QUALITIES.includes(args[0])) {
    quality = args[0]
    url = args.slice(1).join(' ')
  }

  if (!/youtu\.be|youtube\.com/.test(url))
    return m.reply('Link YouTube tidak valid.')

  await conn.reply(m.chat, global.wait, m)

  try {
    const res = await ytdl(url, quality)

    const rawPath = `./tmp/raw_${Date.now()}.mp4`
    const outPath = `./tmp/out_${Date.now()}.mp4`

    const vid = await axios.get(res.mediaUrl, { responseType: 'arraybuffer' })
    fs.writeFileSync(rawPath, vid.data)

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${rawPath}" -c:v libx264 -preset veryfast -movflags +faststart -pix_fmt yuv420p -profile:v baseline -level 3.0 -c:a aac -b:a 128k "${outPath}"`,
        err => err ? reject(err) : resolve()
      )
    })

    const buffer = fs.readFileSync(outPath)

    let caption =
`🎬 *${res.caption || 'YouTube Video'}*
🚩 Quality: ${quality}
💢 Durasi: ${res.videoMeta?.duration || '-'} detik`

    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      caption
    }, { quoted: m })

    fs.unlinkSync(rawPath)
    fs.unlinkSync(outPath)

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal download atau convert video.')
  }
}

handler.help = ['ytmp4 <quality> <url>']
handler.tags = ['download']
handler.command = /^ytmp4$/i
handler.limit = true
handler.register = true

export default handler