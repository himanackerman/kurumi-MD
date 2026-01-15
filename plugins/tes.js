let handler = async (m, { conn }) => {
  try {
    let url = 'https://files.catbox.moe/gvbavb.webp'
    await conn.sendFile(m.chat, url, 'stiker.webp', '', m, { asSticker: true })
  } catch (e) {
    m.reply('Gagal mengirim stiker.')
  }
}

handler.customPrefix = /^(tes|bot|test)$/i
handler.command = new RegExp

export default handler