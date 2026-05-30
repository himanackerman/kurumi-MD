import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)
const archiverLib = require('archiver')
const archiver = (format, opts) => new archiverLib.ZipArchive(opts)

const handler = async (m, { conn }) => {
  try {

    const root = process.cwd()
    const tmpDir = path.join(root, 'tmp')
    const tmpFile = path.join(tmpDir, 'file')

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(tmpFile)) fs.writeFileSync(tmpFile, 'tmp active')

    await m.reply('✨ sedang membuat backup...')

    const date = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })

    const backupName = `Kurumi-MD-${date}.zip`
    const output = fs.createWriteStream(backupName)
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.pipe(output)

    archive.glob('**/*', {
      cwd: root,
      ignore: [
        'node_modules/**',
        'sessions/**',
        '.npm/**',
        'core/**',
        'tmp/**',
        '*.zip',
        backupName
      ]
    })

    archive.directory(tmpDir, 'tmp')

    output.on('close', async () => {
      const owner = global.owner?.[0]?.[0]
        ? global.owner[0][0] + '@s.whatsapp.net'
        : m.sender

      const size = (archive.pointer() / 1024 / 1024).toFixed(2)

      const caption = `✨ Backup Code Bot

📁 File: ${backupName}
📦 Size: ${size} MB
📅 ${date}`

      await conn.sendFile(owner, backupName, backupName, caption, m)

      if (owner !== m.chat) {
        await m.reply('✅ backup berhasil dikirim ke owner')
      }

      if (fs.existsSync(backupName)) fs.unlinkSync(backupName)
    })

    archive.finalize()

  } catch (e) {
    m.reply('❌ backup gagal:\n' + e.message)
  }
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^backup$/i
handler.owner = true

export default handler