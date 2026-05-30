import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
let name = text ? text : m.pushName
let percent = Math.floor(Math.random() * 101)
let desc = ''
if (percent < 25) {
desc = 'Masih normal sepertinya, belum terinfeksi Ngawi.'
} else if (percent < 50) {
desc = 'Sudah mulai menyukai Mas Amba dan Rusdi.'
} else if (percent < 75) {
desc = 'Jomok level menengah, sering nonton video Ironi.'
} else {
desc = 'PARAH! Kamu adalah reinkarnasi Ambatron Jomok sejati!'
}
let res = '--- HASIL CEK JOMOK NGAWI ---\n\n' + 'Nama: ' + name + '\n' + 'Hasil: ' + percent + '%\n' + 'Keterangan: ' + desc
m.reply(res)
}
handler.help = ['cekjomok']
handler.tags = ['fun']
handler.command = /^(cek)?jomok$/i
export default handler