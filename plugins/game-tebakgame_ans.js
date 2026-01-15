/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

import similarity from 'similarity'
const threshold = 0.72
export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe  || !m.text || !/gunakan.*hgame/i.test(m.quoted.text) || /.*hgame/i.test(m.text))
        return !0
    this.tebakgames = this.tebakgames ? this.tebakgames : {}
    if (!(id in this.tebakgames))
        return conn.reply(m.chat, 'Soal itu telah berakhir :v', m)
    if (m.quoted.id == this.tebakgames[id][0].id) {
        let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
        if (isSurrender) {
            clearTimeout(this.tebakgames[id][3])
            delete this.tebakgames[id]
            return conn.reply(m.chat, '*Yah Menyerah :( !*', m)
        }
        let json = JSON.parse(JSON.stringify(this.tebakgames[id][1]))
        // m.reply(JSON.stringify(json, null, '\t'))
        if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.tebakgames[id][2]
            conn.reply(m.chat, `*Benar!*\n+${this.tebakgames[id][2]} XP`, m)
            clearTimeout(this.tebakgames[id][3])
            delete this.tebakgames[id]
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold)
            m.reply(`*Dikit Lagi!*`)
        else
            conn.reply(m.chat, `*Salah!*`, m)
    }
    return !0
}
export const exp = 0