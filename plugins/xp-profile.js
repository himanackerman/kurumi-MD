import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'

let handler = async (m, { conn }) => {

  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

  if (!(who in global.db.data.users))
    return m.reply('User tidak ada di database.')

  let user = global.db.data.users[who]
  let name = user.registered ? user.name : await conn.getName(who)
  let number = PhoneNumber('+' + who.split('@')[0]).getNumber('international')

  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = 'https://i.ibb.co/2WzLyGk/profile.jpg'
  }

  let bio
  try {
    bio = (await conn.fetchStatus(who))?.status || 'Tidak ada bio'
  } catch {
    bio = 'Tidak ada bio'
  }

  let week = moment().tz('Asia/Jakarta').format('dddd')
  let date = moment().tz('Asia/Jakarta').format('DD MMMM YYYY')
  let time = moment().tz('Asia/Jakarta').format('HH:mm:ss')

  let {
    role = 'Beginner',
    level = 0,
    exp = 0,
    limit = 0,
    premiumTime = 0,
    registered = false,
    age = '-'
  } = user

  let premium = premiumTime > 0 ? 'Aktif' : 'Tidak'

  let text = `
🕰️ *Kurumi Profile*

👤 Nama : *${name}*
🎂 Umur : *${registered ? age : '-'}*
💬 Bio : ${bio}

🏷️ Tag : @${who.split('@')[0]}
📱 Nomor : ${number}
🔗 Link : https://wa.me/${who.split('@')[0]}

💢 Role : *${role}*
⭐ Level : *${level}*
✨ EXP : *${exp}*
🎫 Limit : *${limit}*
💎 Premium : *${premium}*

📅 ${week}, ${date}
⏰ ${time}
`.trim()

  let imagePayload = Buffer.isBuffer(pp)
    ? { image: pp }
    : { image: { url: pp } }

  await conn.sendMessage(m.chat, {
    ...imagePayload,
    caption: text,
    mentions: [who]
  }, { quoted: m })
}

handler.help = ['profile', 'profil', 'me', 'my']
handler.tags = ['info', 'xp']
handler.command = /^(profile|profil|me|my)$/i
handler.limit = false

export default handler