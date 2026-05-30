import { getImageProcessingLibrary } from 'baileys'

let handler = async (m, { conn, usedPrefix, command }) => {

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) {
    throw `Reply foto dengan caption *${usedPrefix + command}*`
  }

  await m.react('✨')

  try {

    let img = await q.download()

    const lib = await getImageProcessingLibrary()

    let output = img

    if (lib.sharp?.default) {

      output = await lib.sharp.default(img)

        .resize({
          width: 1080,
          fit: 'inside'
        })

        .jpeg({
          quality: 100
        })

        .toBuffer()
    }

    await conn.updateProfilePicture(
      conn.user.jid,
      output
    )

    await m.react('✅')

  } catch (e) {

    console.log(e)

    await m.react('❌')

    m.reply('Gagal mengganti PP bot')
  }
}

handler.help = ['setppbot']
handler.tags = ['owner']
handler.command = /^(set(botpp|ppbot))$/i
handler.rowner = true

export default handler