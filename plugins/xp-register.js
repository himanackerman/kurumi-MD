import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix }) {

  let user = global.db.data.users[m.sender]

  let pp
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    pp = 'https://i.ibb.co/2WzLyGk/profile.jpg'
  }

  if (user.registered === true)
    throw `🕰️ Kamu sudah terdaftar.\nGunakan *${usedPrefix}unreg* untuk daftar ulang.`

  if (!Reg.test(text))
    return m.reply(`🖤 Masukkan *Nama.Umur*\nContoh:\n${usedPrefix}daftar Kurumi.17`)

  let [_, name, _splitter, age] = text.match(Reg)

  if (!name) throw 'Nama tidak boleh kosong.'
  if (!age) throw 'Umur tidak boleh kosong.'

  age = parseInt(age)
  if (age > 60) throw 'Umur terlalu tinggi.'
  if (age < 10) throw 'Umur belum mencukupi.'

  user.name = name.trim()
  user.age = age
  user.regTime = Date.now()
  user.registered = true

  let sn = createHash('md5').update(m.sender).digest('hex')
  let totalUser = Object.values(global.db.data.users).filter(v => v.registered).length

  let textResult = `
🕰️ *Registrasi Berhasil*

👤 Nama : *${name}*
🎂 Umur : *${age} Tahun*
📌 Status : *Aktif*
🔐 Serial : ${sn}

✨ Kamu adalah user ke *${totalUser}*
`.trim()

  let imagePayload = Buffer.isBuffer(pp)
    ? { image: pp }
    : { image: { url: pp } }

  await conn.sendMessage(m.chat, {
    ...imagePayload,
    caption: textResult
  }, { quoted: m })
}

handler.help = ['daftar <nama>.<umur>']
handler.tags = ['xp']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler