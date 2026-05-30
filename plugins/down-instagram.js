import axios from "axios"
import FormData from "form-data"
import * as cheerio from "cheerio"

async function igdl(url) {
  const form = new FormData()

  form.append("url", url)
  form.append("action", "post")

  const res = await axios.post(
    "https://snapinsta.top/action.php",
    form,
    {
      headers: {
        ...form.getHeaders(),
        "user-agent": "Mozilla/5.0 (Linux; Android 10)",
        "accept": "*/*",
        "origin": "https://snapinsta.top",
        "referer": "https://snapinsta.top/"
      }
    }
  )

  const $ = cheerio.load(res.data)

  const downloads = []

  $(".download-items__btn a").each((_, el) => {
    let path = $(el).attr("href")

    if (!path) return

    if (!path.startsWith("http")) {
      path = "https://snapinsta.top" + path
    }

    downloads.push(path)
  })

  return downloads
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  try {
    if (!args[0]) {
      return m.reply(
        `Contoh:\n${usedPrefix + command} https://www.instagram.com/p/xxxx/`
      )
    }

    await m.react('🕒')

    const results = await igdl(args[0])

    if (!results.length) {
      throw 'Media tidak ditemukan'
    }

    const caption = `
— INSTAGRAM DOWNLOADER —

❀ URL :
${args[0]}
`.trim()

    const album = []

    for (let i = 0; i < results.length; i++) {
      const url = results[i]

      let buf = (
        await axios.get(url, {
          responseType: "arraybuffer"
        })
      ).data

      buf = Buffer.from(buf)

      if (buf.slice(4, 8).toString() === "ftyp") {
        await conn.sendMessage(
          m.chat,
          {
            video: buf,
            mimetype: 'video/mp4',
            caption: i === 0 ? caption : ''
          },
          { quoted: m }
        )
      } else {
        album.push({
          image: buf,
          caption: i === 0 ? caption : ''
        })
      }
    }

    if (album.length) {
      await conn.sendMessage(
        m.chat,
        {
          album
        },
        { quoted: m }
      )
    }

    await m.react('✅')

  } catch (e) {
    console.log(e)

    await m.react('❌')
    m.reply(String(e?.message || e))
  }
}

handler.help = ['igdl', 'ig', 'instagram']
handler.command = /^(igdl|ig|instagram)$/i
handler.tags = ['downloader']
handler.limit = true

export default handler