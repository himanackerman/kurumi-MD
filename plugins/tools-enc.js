import JavaScriptObfuscator from 'javascript-obfuscator'
import { promises as fs } from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply('Masukkan kode JavaScript yang ingin di-obfuscate')
  }

  try {
    const result = JavaScriptObfuscator.obfuscate(text, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 1
    })

    const code = result.getObfuscatedCode()
    const filename = `obfuscated-${Date.now()}.js`
    const filepath = path.join('./tmp', filename)

    await fs.writeFile(filepath, code)

    await conn.sendMessage(m.chat, {
      document: await fs.readFile(filepath),
      fileName: filename,
      mimetype: 'application/javascript'
    }, { quoted: m })

    await fs.unlink(filepath)

  } catch (e) {
    return m.reply('Gagal meng-obfuscate kode')
  }
}

handler.help = ['enc <code>']
handler.tags = ['tools']
handler.command = /^enc$/i
handler.limit = true

export default handler