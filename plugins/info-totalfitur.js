let handler = async (m, { conn }) => {
  try {
    await m.react('📊')

    let totalFitur = Object.values(global.plugins)
      .filter(v =>
        v.help &&
        v.tags &&
        !v.disabled
      )
      .length

    let totalCommand = Object.values(global.plugins)
      .map(v => v.command)
      .filter(v => v)
      .map(v =>
        Array.isArray(v)
          ? v.length
          : 1
      )
      .reduce((a, b) => a + b, 0)

    await m.react('✅')

    await conn.sendMessage(m.chat, {
      disclaimerText: 'Bot Information',
      headerText: `## ${global.namebot}`,
      contentText: '---',
      title: 'Total Features',
      table: [
        ['', 'Total'],
        ['Feature', `${totalFitur}`],
        ['Command', `${totalCommand}`]
      ],
      noHeading: false
    }, {
      quoted: m
    })

  } catch (e) {
    console.log(e)
    m.reply('...error.')
  }
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = /^totalfitur$/i
handler.limit = false

export default handler