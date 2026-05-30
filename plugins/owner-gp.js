import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
  if (!isROwner) return
  if (!text) throw `uhm.. where the text?\n\nexample:\n${usedPrefix + command} menu`

  await m.reply(global.wait)

  let ar = Object.keys(global.plugins)
  let ar1 = ar.map(v => v.replace('.js', ''))

  if (!ar1.includes(text)) {
    let list = ar1.map(v => `• ${v}`).join('\n')
    return m.reply(
      `❌ *Plugin Tidak Ditemukan*\n\n` +
      `📦 *Daftar Plugin:*\n${list}`
    )
  }

  let o
  try {
    o = await exec('cat plugins/' + text + '.js')
  } catch (e) {
    o = e
  }

  let { stdout, stderr } = o

  if (stdout) {
    await conn.sendMessage(m.chat, {
      code: stdout.trim(),
      language: 'javascript'
    }, { quoted: m })
  }

  if (stderr) {
    await conn.sendMessage(m.chat, {
      code: stderr.trim(),
      language: 'bash'
    }, { quoted: m })
  }
}

handler.help = ['getplugin']
handler.tags = ['owner']
handler.command = /^(getplugin|gp)$/i
handler.rowner = true

export default handler