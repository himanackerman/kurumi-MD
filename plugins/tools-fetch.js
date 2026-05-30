import fetch from 'node-fetch'
import path from 'path'
import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `Masukkan URL yang ingin diambil.

Contoh:
${usedPrefix + command} https://example.com`
  }

  if (!/^https?:\/\//i.test(text)) {
    text = 'https://' + text
  }

  try {
    await m.reply(global.wait)

    const res = await fetch(text, {
      redirect: 'follow',
      follow: 999
    })

    const contentType = res.headers.get('content-type') || ''
    const contentLength = Number(res.headers.get('content-length') || 0)

    if (contentLength > 100 * 1024 * 1024) {
      throw 'Ukuran file terlalu besar (maksimal 100 MB)'
    }

    const filename =
      path.basename(new URL(res.url).pathname) || 'file'

    if (/^image\//i.test(contentType)) {
      return conn.sendFile(m.chat, res.url, filename, '', m)
    }

    if (/^video\//i.test(contentType)) {
      return conn.sendFile(m.chat, res.url, filename, '', m)
    }

    if (/^audio\//i.test(contentType)) {
      return conn.sendFile(m.chat, res.url, filename, '', m)
    }

    if (
      /pdf|zip|rar|7z|apk|octet-stream/i.test(contentType)
    ) {
      return conn.sendFile(m.chat, res.url, filename, '', m)
    }

    if (/application\/json/i.test(contentType)) {
      let json = await res.json()
      let txt = format(JSON.stringify(json, null, 2))

      if (txt.length > 4000) {
        return conn.sendFile(
          m.chat,
          Buffer.from(txt),
          'result.json',
          '',
          m
        )
      }

      return m.reply(txt)
    }

    if (
      /^text\//i.test(contentType) ||
      /javascript|xml|html/i.test(contentType)
    ) {
      let txt = await res.text()

      if (txt.length > 4000) {
        let ext = 'txt'

        if (/html/i.test(contentType)) ext = 'html'
        else if (/xml/i.test(contentType)) ext = 'xml'
        else if (/javascript/i.test(contentType)) ext = 'js'

        return conn.sendFile(
          m.chat,
          Buffer.from(txt),
          `result.${ext}`,
          '',
          m
        )
      }

      return m.reply(txt)
    }

    return conn.sendFile(
      m.chat,
      res.url,
      filename,
      '',
      m
    )

  } catch (e) {
    throw e
  }
}

handler.help = ['fetch <url>', 'get <url>']
handler.tags = ['tools']
handler.command = /^(fetch|get)$/i
handler.owner = false
handler.limit = false

export default handler