import fs from 'fs'
import moment from 'moment-timezone'
import * as levelling from '../lib/levelling.js'

moment.locale('id')

const cooldown = new Map()

function formatTag(tag) {
  return tag
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function ucapan() {
  const jam = moment.tz('Asia/Jakarta').hour()
  if (jam >= 4 && jam < 11) return 'Selamat Pagi'
  if (jam >= 11 && jam < 15) return 'Selamat Siang'
  if (jam >= 15 && jam < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

let handler = async (m, { conn, usedPrefix, command, text, isOwner }) => {

  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = {
    limit: 10,
    exp: 0,
    level: 0,
    role: 'Newbie',
    premiumTime: 0
  }

  let who = m.sender
  let name = `@${who.split('@')[0]}`

  let exp = user.exp
  let level = user.level
  let role = user.role

  let { max } = levelling.xpRange(level, global.multiplier || 1)

  let limit = isOwner
    ? '∞'
    : user.premiumTime > 0
    ? 'Unlimited'
    : `${user.limit}`

  const readMore = String.fromCharCode(8206).repeat(4001)

  let plugins = Object.values(global.plugins).filter(p => !p.disabled)

  let categories = {}

  for (let plugin of plugins) {

    let helps = Array.isArray(plugin.help)
      ? plugin.help
      : plugin.help
      ? [plugin.help]
      : []

    let tags = Array.isArray(plugin.tags)
      ? plugin.tags
      : plugin.tags
      ? [plugin.tags]
      : []

    for (let tag of tags) {

      if (!tag) continue

      if (!categories[tag]) categories[tag] = []

      categories[tag].push({
        helps,
        limit: !!plugin.limit,
        premium: !!plugin.premium,
        prefix: !!plugin.customPrefix
      })

    }

  }

  let menuText = `
❀ 「 *KURUMI MD* 」 ❀
${ucapan()} ${name}

Halo aku Kurumi, siap bantu kamu hari ini ✨

♡ Role : ${role}
♡ Level : ${level}
♡ XP : ${exp}/${max}
♡ Limit : ${limit}

────────────
${readMore}
`

  let menuType = text?.toLowerCase().trim()

  if (!menuType) {

    menuText += `❀ *DAFTAR MENU* ❀\n`

    for (let tag of Object.keys(categories).sort()) {
      menuText += `⌬ ${usedPrefix + command} ${tag}\n`
    }

    menuText += `⌬ ${usedPrefix + command} all\n`

  }

  else if (menuType === 'all') {

    for (let tag of Object.keys(categories).sort()) {

      menuText += `\n❀ ${formatTag(tag)} ❀\n`

      for (let item of categories[tag]) {

        for (let cmd of item.helps) {

          let premium = item.premium ? ' 🄿' : ''
          let lim = item.limit ? ' 🄻' : ''
          let prefix = item.prefix ? '' : usedPrefix

          menuText += `⌬ ${prefix + cmd}${premium}${lim}\n`

        }

      }

    }

  }

  else if (categories[menuType]) {

    menuText += `\n❀ ${formatTag(menuType)} ❀\n`

    for (let item of categories[menuType]) {

      for (let cmd of item.helps) {

        let premium = item.premium ? ' 🄿' : ''
        let lim = item.limit ? ' 🄻' : ''
        let prefix = item.prefix ? '' : usedPrefix

        menuText += `⌬ ${prefix + cmd}${premium}${lim}\n`

      }

    }

  }

  else {

    menuText += `\nMenu *${text}* tidak ditemukan.`

  }

  let msg = {
    document: Buffer.from([1,2,3,4,5]),
    mimetype: 'application/pdf',
    fileName: 'Kurumi-MD.pdf',
    fileLength: 999999999999,
    pageCount: 999,
    caption: menuText.trim(),
    contextInfo: {
      mentionedJid: [who],
      externalAdReply: {
        title: "❀ Kurumi MD ❀",
        body: "Simple WhatsApp Bot",
        thumbnailUrl: "https://raw.githubusercontent.com/himanackerman/Image/main/1767940700814-735.jpeg",
        renderLargerThumbnail: true,
        mediaType: 1,
        sourceUrl: "https://github.com/himanackerman"
      }
    }
  }

  await conn.sendMessage(m.chat, msg, { quoted: m })

  let last = cooldown.get(m.sender) || 0

  if (Date.now() - last > 60000) {

    cooldown.set(m.sender, Date.now())

    await conn.sendFile(
      m.chat,
      'https://files.catbox.moe/cbqa7t.aac',
      'menu.aac',
      '',
      m,
      true,
      {
        mimetype: 'audio/mp4',
        ptt: true
      }
    )

  }

}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|perintah)$/i

export default handler
