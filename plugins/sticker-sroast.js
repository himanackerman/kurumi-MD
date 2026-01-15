/*
# Creator : Hanzoffc
# Feature : .sroast
# Module : canvas & wa-sticker-formatter

*/
import { createCanvas } from 'canvas'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
`Format:
${usedPrefix + command} text1 | text2 | text3

Contoh:
${usedPrefix + command} eh lu kalok gabisa ngoding jangan maksa deh kacung | GG BANG CODENYA | idiot coding copy sana sini ngapain di publish, main ff aja sana kontol`
    )
  }

  const parts = text.split('|').map(v => v.trim())
  const t1 = parts[0] || '-'
  const t2 = (parts[1] || '-').toUpperCase()
  const t3 = parts[2] || '-'

  await m.reply('Tunggu sebentar ya kak 🕒')

  const width = 512
  const height = 512
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  const marginXText = 70
  const marginXTitle = 30
  const maxWidthTop = width - marginXText * 2
  const maxWidthTitle = width - marginXTitle * 2
  const maxWidthBottom = width - marginXText * 2

  const lineHeightSmall = 34
  const spacingAfterT1 = 14
  const spacingAfterT2 = 18
  const maxTitleLines = 2

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ')
    const lines = []
    let line = ''

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? line + ' ' + words[i] : words[i]
      const { width } = ctx.measureText(testLine)
      if (width > maxWidth && line) {
        lines.push(line)
        line = words[i]
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
    return lines
  }

  ctx.font = '28px sans-serif'
  let lines1 = wrapText(ctx, t1, maxWidthTop)
  const heightT1 = lines1.length * lineHeightSmall

  let fontSizeTitle = 60
  let lines2

  while (fontSizeTitle > 30) {
    ctx.font = `bold ${fontSizeTitle}px sans-serif`
    lines2 = wrapText(ctx, t2, maxWidthTitle)
    if (lines2.length <= maxTitleLines) break
    fontSizeTitle -= 2
  }

  const lineHeightTitle = fontSizeTitle + 6
  const heightT2 = lines2.length * lineHeightTitle

  ctx.font = '28px sans-serif'
  let lines3 = wrapText(ctx, t3, maxWidthBottom)
  const heightT3 = lines3.length * lineHeightSmall

  const totalHeight =
    heightT1 +
    spacingAfterT1 +
    heightT2 +
    spacingAfterT2 +
    heightT3

  let y = (height - totalHeight) / 2

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#6b7280'
  ctx.font = '28px sans-serif'

  for (const line of lines1) {
    ctx.fillText(line, marginXText, y)
    y += lineHeightSmall
  }
  y += spacingAfterT1

  ctx.fillStyle = '#000000'
  ctx.font = `bold ${fontSizeTitle}px sans-serif`

  for (const line of lines2) {
    ctx.fillText(line, marginXTitle, y)
    y += lineHeightTitle
  }
  y += spacingAfterT2

  ctx.fillStyle = '#6b7280'
  ctx.font = '28px sans-serif'

  for (const line of lines3) {
    ctx.fillText(line, marginXText, y)
    y += lineHeightSmall
  }

  const imgBuffer = canvas.toBuffer('image/png')

  const stiker = await createStickerFromBuffer(
    imgBuffer,
    'Rikka-bot',
    'Hanzoffc',
    80
  )

  if (stiker) {
    await conn.sendFile(m.chat, stiker, 'sroast.webp', '', m)
  }
}

handler.help = ['sroast <text1 | text2 | text3>', 'stickerroast <text1 | text2 | text3>']
handler.tags = ['sticker']
handler.command = /^(sroast|stickerroasting)$/i
handler.limit = true
handler.onlyprem = false

export default handler

async function createStickerFromBuffer(imgBuffer, packName, authorName, quality) {
  const stickerMetadata = {
    type: 'crop',
    pack: packName,
    author: authorName,
    quality
  }
  return new Sticker(imgBuffer, stickerMetadata).toBuffer()
}