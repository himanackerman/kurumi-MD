let handler = async (m, { conn, participants }) => {
    let member = participants.map(u => u.id)
    let partner = member[Math.floor(Math.random() * member.length)]
    
    if (partner === m.sender) return m.reply("Yah, kamu jomblo akut ya? Masa jadian sama diri sendiri...")

    let caption = `— fun jadian —

❀ Kamu : @${m.sender.split('@')[0]}
❀ Pasangan : @${partner.split('@')[0]}

Semoga langgeng ya!`

    await conn.sendMessage(m.chat, { 
        text: caption, 
        mentions: [m.sender, partner] 
    }, { quoted: m })
}

handler.help = ['jadian']
handler.tags = ['fun']
handler.command = /^jadian$/i
handler.limit = true
handler.register = true

export default handler