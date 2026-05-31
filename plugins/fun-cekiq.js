import { format } from 'util'

let handler = async (m, { conn }) => {
    let iq = Math.floor(Math.random() * 200)
    let status = ''
    if (iq > 140) status = 'Jenius'
    else if (iq > 120) status = 'Sangat Cerdas'
    else if (iq > 110) status = 'Cerdas'
    else if (iq > 90) status = 'Normal'
    else if (iq > 80) status = 'Dull'
    else if (iq > 70) status = 'Borderline Deficiency'
    else status = 'Idiot'

    let caption = `*IQ CHECK*\n\nNama: ${m.name}\nSkor IQ: ${iq}\nStatus: ${status}`
    conn.reply(m.chat, caption, m)
}

handler.help = ['cekiq']
handler.tags = ['fun']
handler.command = /^(cekiq|iqtest)$/i

export default handler