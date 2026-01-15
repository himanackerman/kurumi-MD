import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp' // untuk konversi WebP → PNG/JPG

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // pastikan ada sticker
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) {
            return m.reply(
`✨ *TOIMAGE ENGINE*
Reply sticker untuk dikonversi menjadi gambar

Contoh:
${usedPrefix + command}`
            )
        }

        // pastikan folder tmp ada
        const tmpDir = join(__dirname, '../tmp')
        if (!existsSync(tmpDir)) mkdirSync(tmpDir)

        const inputPath = join(tmpDir, `${Date.now()}_sticker.webp`)
        const outputPath = join(tmpDir, `${Date.now()}_toimg.png`)

        const buffer = await q.download()
        writeFileSync(inputPath, buffer)

        // konversi WebP → PNG
        await sharp(inputPath)
            .png()
            .toFile(outputPath)

        const imgBuffer = Buffer.from(await sharp(outputPath).toBuffer())

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: '✨ Sticker berhasil dikonversi menjadi gambar'
        }, { quoted: m })

        unlinkSync(inputPath)
        unlinkSync(outputPath)

    } catch (err) {
        console.error(err)
        return m.reply('❌ Gagal mengubah sticker menjadi gambar.')
    }
}

handler.help = ['toimg <reply sticker>']
handler.tags = ['tools']
handler.command = /^(toimg|sticker2img|stikertoimg)$/i
handler.limit = true

export default handler