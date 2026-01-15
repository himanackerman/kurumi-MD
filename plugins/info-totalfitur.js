let handler = async (m, { conn }) => {

  let totalFitur = Object.values(global.plugins)
    .filter(v => v.help && v.tags).length

  let totalCommand = Object.values(global.plugins)
    .map(v => v.command)
    .filter(v => v)
    .map(v => Array.isArray(v) ? v.length : 1)
    .reduce((a, b) => a + b, 0)

  let text = `
Total Fitur   : ${totalFitur}
Total Command : ${totalCommand}
`.trim()

  await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
handler.limit = false

export default handler