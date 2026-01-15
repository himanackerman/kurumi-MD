import fetch from "node-fetch"
import yts from "yt-search"

function formatNumber(num = 0) {
  return num.toLocaleString()
}

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const yt = {
  base: "https://api.apiapi.lat",

  enc: s => s.split("").map(c => c.charCodeAt()).reverse().join(";"),
  xor: s => s.split("").map(c => String.fromCharCode(c.charCodeAt() ^ 1)).join(""),
  rand: () => {
    const h = "0123456789abcdef"
    return Array.from({ length: 32 }, () => h[Math.floor(Math.random() * h.length)]).join("")
  },

  async init(url) {
    const api = `${this.base}/${this.rand()}/init/${this.enc(url)}/${this.rand()}/`
    const res = await fetch(api, {
      method: "POST",
      body: JSON.stringify({
        data: this.xor(url),
        format: "0",
        mp3Quality: 128
      })
    })
    const j = await res.json()
    if (j.s === "C") return this.file(j.i, j.pk)
    return this.wait(j.i, j.pk)
  },

  file(i, pk) {
    return `${this.base}/${this.rand()}/download/${i}/${this.rand()}/${pk ? pk + "/" : ""}`
  },

  async wait(i, pk) {
    let j
    do {
      await new Promise(r => setTimeout(r, 3000))
      const api = `${this.base}/${this.rand()}/status/${i}/${this.rand()}/${pk ? pk + "/" : ""}`
      j = await (await fetch(api, {
        method: "POST",
        body: JSON.stringify({ data: i })
      })).json()
    } while (j.s === "P")

    if (j.s === "E") throw "Gagal convert audio"
    return this.file(i, pk)
  }
}

async function fetchBufferSafe(url, retry = 3) {
  for (let i = 0; i < retry; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.status)
      return await res.buffer()
    } catch {
      if (i === retry - 1) throw "Gagal download audio"
      await new Promise(r => setTimeout(r, 3000))
    }
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Contoh: .play everything u are hindia")

  const search = await yts(text)
  if (!search.videos.length) throw "Lagu tidak ditemukan"

  const v = search.videos[0]

  const caption = `
✨ *PLAY MUSIC*

> Query   : ${text}
> Judul   : ${v.title}
> Channel : ${v.author.name}
> Durasi  : ${formatDuration(v.seconds)}
> Views   : ${formatNumber(v.views)}
> Upload  : ${v.ago}

> Quality : 128kbps
> Status  : Mengunduh audio...
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: v.thumbnail },
    caption
  }, { quoted: m })

  const dl = await yt.init(v.url)
  const buffer = await fetchBufferSafe(dl)

  if (buffer.length > 50 * 1024 * 1024)
    return m.reply(`File terlalu besar\n${dl}`)

  await conn.sendMessage(m.chat, {
    audio: buffer,
    mimetype: "audio/mpeg"
  }, { quoted: m })
}

handler.help = ["play <judul lagu>"]
handler.tags = ["downloader"]
handler.command = /^play$/i
handler.limit = true
handler.register = true

export default handler