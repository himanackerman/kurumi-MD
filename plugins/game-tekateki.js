import axios from "axios"

async function scrapeTekateki() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/BochilTeam/database/master/games/tekateki.json",
      { timeout: 30000 }
    )
    const data = res.data
    const pick = data[Math.floor(Math.random() * data.length)]
    if (!pick.soal || !pick.jawaban) throw new Error("Invalid Data")
    return {
      soal: pick.soal,
      answer: pick.jawaban.toLowerCase()
    }
  } catch {
    throw new Error("Gagal mengambil data teka-teki!")
  }
}

let timeout = 60000

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  global.tekateki = global.tekateki || {}
  const chat = m.chat
  if (!global.tekateki[chat]) global.tekateki[chat] = {}
  let room = global.tekateki[chat]

  switch (command) {

    case "tekateki": {
      const data = await scrapeTekateki()

      await conn.reply(
        chat,
        `🧩 *TEKA-TEKI*\n\n"${data.soal}"\n\n⏳ Waktu: *60 detik*.\nJawab dengan benar.`,
        m
      )

      global.tekateki[chat] = {
        answer: data.answer,
        player: m.sender,
        timer: setTimeout(() => {
          conn.reply(chat, `❌ Waktu habis!\nJawaban: *${data.answer}*`)
          delete global.tekateki[chat]
        }, timeout)
      }

      break
    }

    case "whoteka": {
      if (!room.answer) return conn.reply(chat, "❌ Tidak ada game aktif.", m)
      if (!isAdmin && !isOwner) return conn.reply(chat, "❌ Tidak diizinkan.", m)

      let ans = room.answer
      let hint = ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.at(-1)

      return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
    }
  }
}

handler.all = async function (m) {
  global.tekateki = global.tekateki || {}
  const room = global.tekateki[m.chat]
  if (!room?.answer) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (text === room.answer || text.includes(room.answer)) {
    clearTimeout(room.timer)

    this.reply(
      m.chat,
      `✅ Benar! 🎉\nJawaban: *${room.answer}*`,
      m
    )

    delete global.tekateki[m.chat]
  }
}

handler.help = ["tekateki"]
handler.tags = ["game"]
handler.command = /^(tekateki|whoteka)$/i
handler.limit = false

export default handler