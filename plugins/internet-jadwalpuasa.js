/**
 *  jadwal puasa 
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 Api : https://api.myquran.com
 */
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return conn.reply(
      m.chat,
      `Masukkan nama kota

Contoh:
${usedPrefix + command} tasikmalaya`,
      m
    )
  }

  try {
    const { data: search } = await axios.get(
      `https://api.myquran.com/v3/sholat/kabkota/cari/${encodeURIComponent(text)}`,
      { timeout: 10000 }
    )

    if (!search.data.length) throw 'Kota tidak ditemukan'

    const kota = search.data[0]

    const { data: jadwalRes } = await axios.get(
      `https://api.myquran.com/v3/sholat/jadwal/${kota.id}/today?tz=Asia/Jakarta`,
      { timeout: 10000 }
    )

    const info = jadwalRes.data
    const j = Object.values(info.jadwal)[0]

    const caption = `🌙 *JADWAL PUASA RAMADHAN*

📍 ${info.kabko}
📅 ${j.tanggal}

Imsak : ${j.imsak}
Subuh : ${j.subuh}

Maghrib (Buka Puasa) : ${j.maghrib}`

    conn.reply(m.chat, caption, m)

  } catch (err) {
    console.log(err.message)
    conn.reply(m.chat, 'Kota tidak ditemukan.', m)
  }
}

handler.help = ['jadwalpuasa <kota>']
handler.tags = ['internet']
handler.command = /^jadwalpuasa$/i
handler.limit = false

export default handler