import axios from "axios"

const BASE_API = "https://host.optikl.ink/soundcloud"
const scSession = {}

async function scSearch(query, limit = 10) {
  const { data } = await axios.get(`${BASE_API}/search`, {
    params: { query },
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    timeout: 15000
  })

  if (!Array.isArray(data)) return []

  return data.slice(0, limit).map((t, i) => ({
    no: i + 1,
    title: t.title || "Untitled",
    author: t.author?.name || "Unknown",
    url: t.url
  }))
}

async function scDownload(url) {
  const { data } = await axios.get(`${BASE_API}/download`, {
    params: { url },
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    timeout: 15000
  })

  if (!data?.audio_url) throw new Error("Gagal mengambil audio")

  return {
    title: data.title || "Unknown",
    author: data.author || "Unknown",
    audio: data.audio_url
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      ` Gunakan:\n> ${usedPrefix + command} <judul lagu>`
    )
  }

  const list = await scSearch(text, 10)
  if (!list.length) return m.reply("> Tidak ada hasil")

  let out = `*Hasil pencarian SoundCloud:*\n\n`
  for (const r of list) {
    out += `*${r.no}.* ${r.title}\n> ${r.author}\n\n`
  }
  out += `> Ketik nomor untuk download`

  const sent = await m.reply(out)
  scSession[m.chat] = { list, msg: sent }
}

handler.before = async (m, { conn }) => {
  const s = scSession[m.chat]
  if (!s) return
  if (m.quoted?.id !== s.msg.id) return
  if (!/^\d+$/.test(m.text)) return

  const idx = parseInt(m.text) - 1
  const pick = s.list[idx]
  if (!pick) return

  await m.reply(`*[ Note ]* Lagi di proses bg`)

  try {
    const dl = await scDownload(pick.url)

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: dl.audio },
        mimetype: "audio/mpeg",
        fileName: `${dl.title}.mp3`,
        caption: `*${dl.title}*\n> ${dl.author}`
      },
      { quoted: m }
    )
  } catch (e) {
    m.reply(`> ${e.message}`)
  }

  delete scSession[m.chat]
}

handler.help = ["soundcloud <query>"]
handler.tags = ["download"]
handler.command = /^soundcloud$/i
handler.limit = true

export default handler