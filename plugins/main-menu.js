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

  let menuType = text?.toLowerCase().trim()

  const caption = `❀  *𝘒𝘜𝘙𝘜𝘔𝘐 𝘔𝘜𝘓𝘛𝘐 𝘋𝘌𝘝𝘐𝘊𝘌*  ❀
${ucapan()} ${name}

Halo aku Kurumi, siap bantu kamu hari ini ✨

♡ Role : ${role}
♡ Level : ${level}
♡ XP : ${exp}/${max}
♡ Limit : ${limit}`

  if (!menuType) {
    const arrayMenu = Object.keys(categories).sort()

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://raw.githubusercontent.com/himanackerman/Image/main/1767940700814-735.jpeg'
        },
        caption,
        footer: 'ᴋᴜʀᴜᴍɪ ᴍᴅ • ʙy ʜɪʟᴍᴀɴ',
        mentions: [who],
        optionText: 'Pilih Kategori',
        optionTitle: 'Menu Tersedia',
        nativeFlow: [
          {
            text: 'Pilih Kategori Menu',
            sections: [
              {
                title: `Semua Kategori (${arrayMenu.length})`,
                rows: arrayMenu.map(v => ({
                  header: '',
                  title: formatTag(v),
                  description: `Lihat menu ${formatTag(v)}`,
                  id: `${usedPrefix}menu ${v}`
                }))
              }
            ]
          },
          {
            text: 'All Menu',
            id: `${usedPrefix}menu all`
          },
          {
            text: 'Channel',
            url: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K'
          }
        ]
      },
      { quoted: m }
    )

  } else if (menuType === 'all') {
    let menuText = caption + '\n\n'

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

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://raw.githubusercontent.com/himanackerman/Image/main/1767940700814-735.jpeg'
        },
        caption: menuText.trim(),
        mentions: [who]
      },
      { quoted: m }
    )

  } else if (categories[menuType]) {
    let menuText = caption + `\n\n❀ ${formatTag(menuType)} ❀\n`

    for (let item of categories[menuType]) {
      for (let cmd of item.helps) {
        let premium = item.premium ? ' 🄿' : ''
        let lim = item.limit ? ' 🄻' : ''
        let prefix = item.prefix ? '' : usedPrefix
        menuText += `⌬ ${prefix + cmd}${premium}${lim}\n`
      }
    }

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://raw.githubusercontent.com/himanackerman/Image/main/1767940700814-735.jpeg'
        },
        caption: menuText.trim(),
        mentions: [who]
      },
      { quoted: m }
    )

  } else {
    await conn.sendMessage(
      m.chat,
      {
        text: `Menu *${text}* tidak ditemukan.`
      },
      { quoted: m }
    )
  }

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
