let handler = async (m, { conn, text }) => {
let target = text ? text : (m.quoted ? m.quoted.sender : m.sender)
let name = text ? text : await conn.getName(target)
let random = Math.floor(Math.random() * 100)
let caption = `
*HASIL CEK KARBIT*

Nama: ${name}
Persentase: ${random}%

${random > 70 ? 'Fix karbitan ini mah! 😂' : random > 40 ? 'Dikit lagi jadi karbitan.' : 'Bukan karbitan, aman bos! ✅'}
`.trim()
conn.reply(m.chat, caption, m)
}
handler.help = ['cekkarbit']
handler.tags = ['fun']
handler.command = /^(cekkarbit|karbit)$/i
export default handler