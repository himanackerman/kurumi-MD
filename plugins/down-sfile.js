import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw 'Masukkan URL sfile.mobi!'
try {
let res = await fetch('https://api.nexray.eu.cc/downloader/sfile?url=' + encodeURIComponent(text))
let json = await res.json()
if (!json.status) throw 'Gagal mengambil data'
let { file_name, size, url, author_name, upload_date } = json.result
let caption = 'Nama: ' + file_name + '\nUkuran: ' + size + '\nUpload: ' + upload_date + '\nAuthor: ' + author_name
await conn.reply(m.chat, caption, m)
await conn.sendMessage(m.chat, { document: { url: url }, fileName: file_name, mimetype: 'application/octet-stream' }, { quoted: m })
} catch (e) {
throw 'Terjadi kesalahan saat memproses permintaan'
}
}
handler.help = ['sfile <url>']
handler.tags = ['downloader']
handler.command = /^(sfile)$/i

export default handler