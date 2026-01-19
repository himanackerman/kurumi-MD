import fetch from 'node-fetch'
import moment from 'moment-timezone'
import * as levelling from '../lib/levelling.js'

moment.locale('id')

const cooldown = new Map()

const MENU_THUMB = 'https://raw.githubusercontent.com/himanackerman/Image/main/1767940700814-735.jpeg'

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

const defaultMenu = {
  before: `
┌ ◦ *[ %me ]*
├ ${ucapan()} %name
│
│ ◦ Uptime : *%uptime*
│ ◦ Limit : *%limit*
│ ◦ Role : *%role*
│ ◦ Level : *%level (%exp / %maxexp)*
│ ◦ Sisa XP Level Up : *%xp4levelup*
│ ◦ %totalexp XP secara Total
│
│ ◦ Note :
│ ◦ *🄿* = Premium
│ ◦ *🄻* = Limit
└────
%readmore
`.trim(),
  header: '╭─「 *%category* 」',
  body: '│ • %cmd',
  footer: '╰────\n',
  after: `ᴋᴜʀᴜᴍɪ ᴍᴅ ʙy ʜɪʟᴍᴀɴ`
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    let user = global.db.data.users[m.sender]

    let name = `@${m.sender.split('@')[0]}`
    let botname = conn.user?.name || "ᴋᴜʀᴜᴍɪ ᴍᴅ ʙy ʜɪʟᴍᴀɴ"
    let limit = user.premiumTime > 0 ? 'Unlimited' : `${user.limit ?? 10}`

    let exp = user.exp || 0
    let level = user.level || 0
    let role = user.role || 'Beginner'
    let totalexp = user.totalexp || exp

    let { max } = levelling.xpRange(level, global.multiplier || 1)
    let maxexp = max
    let xp4levelup = `${Math.max(max - exp, 0)} XP`

    let uptime = clockString(process.uptime() * 1000)

    let plugins = Object.values(global.plugins || {}).filter(p => !p.disabled)
    let categories = {}

    for (let plugin of plugins) {
      let helps = Array.isArray(plugin.help) ? plugin.help : plugin.help ? [plugin.help] : []
      let tags = Array.isArray(plugin.tags) ? plugin.tags : plugin.tags ? [plugin.tags] : []

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

    const readMore = String.fromCharCode(8206).repeat(4001)

    let replace = {
      name,
      limit,
      me: botname,
      role,
      level,
      exp,
      maxexp,
      xp4levelup,
      totalexp,
      uptime,
      readmore: readMore,
      p: usedPrefix
    }

    let menuType = text?.toLowerCase().trim()
    let menuText = []
    let { before, header, body, footer, after } = defaultMenu

    if (!menuType) {
      let list = Object.keys(categories).sort().map(t => `│ • \`${usedPrefix + command} ${t}\``).join('\n')

      menuText = [
        before.replace(/%(\w+)/g, (_, k) => replace[k] || _),
        "Daftar Menu Tersedia:",
        "╭─「 *DAFTAR MENU* 」",
        `│ • \`${usedPrefix + command} all\``,
        list,
        "╰────\n",
        `Ketik \`${usedPrefix + command} <menu>\``,
        `Contoh: \`${usedPrefix + command} ai\`\n`,
        after
      ]
    } else if (menuType === 'all') {
      menuText.push(before.replace(/%(\w+)/g, (_, k) => replace[k] || _))

      for (let tag of Object.keys(categories).sort()) {
        menuText.push(header.replace('%category', formatTag(tag)))

        for (let item of categories[tag]) {
          for (let cmd of item.helps) {
            let premium = item.premium ? ' (🄿)' : ''
            let lim = item.limit ? ' (🄻)' : ''
            let prefix = item.prefix ? '' : usedPrefix
            menuText.push(body.replace('%cmd', `${prefix}${cmd}${premium}${lim}`))
          }
        }
        menuText.push(footer)
      }

      menuText.push(after)
    } else if (categories[menuType]) {
      menuText.push(before.replace(/%(\w+)/g, (_, k) => replace[k] || _))
      menuText.push(header.replace('%category', formatTag(menuType)))

      for (let item of categories[menuType]) {
        for (let cmd of item.helps) {
          let premium = item.premium ? ' (🄿)' : ''
          let lim = item.limit ? ' (🄻)' : ''
          let prefix = item.prefix ? '' : usedPrefix
          menuText.push(body.replace('%cmd', `${prefix}${cmd}${premium}${lim}`))
        }
      }

      menuText.push(footer)
      menuText.push(after)
    } else {
      menuText = [
        `Menu *${text}* tidak ditemukan.`,
        `Ketik *${usedPrefix + command}* untuk melihat daftar menu.`
      ]
    }

    let finalText = menuText.join('\n').replace(/%(\w+)/g, (_, k) => replace[k] || _)

    const res = await fetch(MENU_THUMB)
    const thumbBuffer = await res.buffer()

    await conn.sendMessage(m.chat, {
      image: thumbBuffer,
      caption: finalText,
      mentions: [m.sender]
    }, { quoted: m })

    let last = cooldown.get(m.sender) || 0
    if (Date.now() - last > 60_000) {
      cooldown.set(m.sender, Date.now())
      await conn.sendFile(
        m.chat,
        'https://files.catbox.moe/4jo6p7.mp3',
        'menu.mp3',
        null,
        m,
        true,
        { type: 'audioMessage', ptt: true }
      )
    }

  } catch (e) {
    console.error(e)
    m.reply("Menu error, coba lagi nanti.")
  }
}

handler.command = /^(menu|hep)$/i
handler.tags = ['main']
handler.help = ['menu', 'help']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}
