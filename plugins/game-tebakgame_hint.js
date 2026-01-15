let handler = async (m, { conn }) => {
    conn.tebakgames = conn.tebakgames ? conn.tebakgames : {}
    let id = m.chat
    if (!(id in conn.tebakgames)) throw false
    let json = conn.tebakgames[id][1]
    conn.reply(m.chat, '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```', m)
}
handler.command = /^hgame$/i

handler.limit = true

export default handler