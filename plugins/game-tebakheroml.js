import axios from "axios"

let timeout = 60000
let poin = 4999

let handler = async (m, { conn, usedPrefix, command }) => {
  conn.game = conn.game || {}
  const id = "tebakheroml-" + m.chat

  if (command === "tebakheroml") {
    if (id in conn.game)
      return m.reply("Masih ada soal yang belum terjawab!")

    let data
    try {
      const res = await axios.get("https://api.deline.web.id/game/tebakheroml")
      if (!res.data?.result) throw new Error()
      data = res.data.result
    } catch {
      return m.reply("Gagal mengambil data hero, coba lagi.")
    }

    const answer = data.jawaban.toLowerCase()
    const clue = data.deskripsi || "Tidak ada deskripsi."

    let caption = `
🎮 *TEBAK HERO ML*
Lihat gambar berikut dan tebak heronya!

Timeout: *${timeout / 1000} detik*
Clue: ${clue}
Ketik *${usedPrefix}whohero* untuk bantuan
Bonus: ${poin} XP
`.trim()

    let msg = await conn.sendFile(m.chat, data.img, "hero.jpg", caption, m)

    conn.game[id] = [
      msg,
      { answer },
      poin,
      setTimeout(() => {
        if (conn.game[id]) {
          conn.reply(
            m.chat,
            `⏳ *Waktu habis!*\nJawabannya adalah: *${answer.toUpperCase()}*`,
            conn.game[id][0]
          )
          delete conn.game[id]
        }
      }, timeout)
    ]
  }

  if (command === "whohero") {
    if (!(id in conn.game)) return m.reply("Tidak ada game aktif.")

    let ans = conn.game[id][1].answer
    let hint =
      ans[0] +
      "_".repeat(Math.max(ans.length - 2, 1)) +
      ans.slice(-1)

    return m.reply(`🧩 *Hint:* ${hint}`)
  }
}

handler.all = async function (m) {
  const id = "tebakheroml-" + m.chat
  if (!(id in this.game)) return

  let text = (m.text || "").trim().toLowerCase()
  if (!text) return

  let ans = this.game[id][1].answer

  if (text === ans) {
    clearTimeout(this.game[id][3])
    this.reply(m.chat, `🎉 *Benar!* Hero tersebut adalah *${ans.toUpperCase()}*`, this.game[id][0])
    delete this.game[id]
  }
}

handler.help = ["tebakheroml"]
handler.tags = ["game"]
handler.command = /^(tebakheroml|whohero)$/i
handler.limit = false

export default handler