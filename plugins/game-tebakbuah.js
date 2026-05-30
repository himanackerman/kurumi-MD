import axios from "axios"

async function scrapeBuah() {
  const res = await axios.get(
    "https://api.codeteam.web.id/api/v1/tebak-buah",
    { timeout: 30000 }
  )

  if (res.data?.status !== "success") throw "API error"

  const d = res.data.data
  return {
    question: d.question,
    clues: d.clues,
    answer: d.answer.toLowerCase().trim(),
  }
}

let timeout = 60000

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  global.tebakbuah = global.tebakbuah || {}
  const chat = m.chat
  const room = global.tebakbuah[chat]

  if (command === "tebakbuah") {
    if (room?.answer)
      return conn.reply(chat, "Masih ada soal belum terjawab di chat ini.", m)

    const data = await scrapeBuah()

    let teks =
      `🍎 *TEBAK BUAH*\n\n` +
      `${data.question}\n\n` +
      `• Warna: ${data.clues.warna}\n` +
      `• Bentuk: ${data.clues.bentuk}\n` +
      `• Habitat: ${data.clues.habitat}\n` +
      `• Rasa: ${data.clues.rasa}\n` +
      `• Ciri khas: ${data.clues.ciri_khas}\n\n` +
      `⏳ Waktu: *60 detik*\n` +
      `Ketik jawaban langsung\n` +
      `Ketik *.whobuah* untuk klu`

    await conn.sendMessage(chat, { text: teks }, { quoted: m })

    global.tebakbuah[chat] = {
      answer: data.answer,
      player: m.sender,
      timer: setTimeout(() => {
        conn.reply(
          chat,
          `❌ Waktu habis!\nJawaban: *${data.answer}*`,
          m
        )
        delete global.tebakbuah[chat]
      }, timeout),
    }
  }

  if (command === "whobuah") {
    const room = global.tebakbuah[chat]
    if (!room?.answer)
      return conn.reply(chat, "❌ Tidak ada game aktif.", m)

    if (!isAdmin && !isOwner)
      return conn.reply(chat, "❌ Klu hanya untuk admin/owner.", m)

    const ans = room.answer
    const hint =
      ans.length <= 2
        ? ans[0] + "_"
        : ans[0] + "_".repeat(ans.length - 2) + ans.slice(-1)

    return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
  }

  if (command === "who") {
    const room = global.tebakbuah[chat]
    if (!room?.player)
      return conn.reply(chat, "❌ Tidak ada game aktif.", m)

    return conn.reply(
      chat,
      `👤 Player: @${room.player.split("@")[0]}`,
      m,
      { mentions: [room.player] }
    )
  }
}

handler.all = async function (m) {
  const room = global.tebakbuah?.[m.chat]
  if (!room?.answer) return
  if (!m.text) return

  const text = m.text.trim().toLowerCase()

  if (text.startsWith(".") || text.startsWith("!")) return

  if (
    text === room.answer ||
    room.answer.includes(text)
  ) {
    clearTimeout(room.timer)
    await this.reply(
      m.chat,
      `✅ *Benar!* 🎉\nJawaban: *${room.answer}*`,
      m
    )
    delete global.tebakbuah[m.chat]
  }
}

handler.help = ["tebakbuah"]
handler.tags = ["game"]
handler.command = /^(tebakbuah|whobuah|who)$/i
handler.limit = false

export default handler