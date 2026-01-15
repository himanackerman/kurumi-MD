import ffmpeg from "fluent-ffmpeg"
import { tmpdir } from "os"
import { join } from "path"
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from "fs"

const runFFmpeg = (input, output, speed) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioFilters(`atempo=${speed}`)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => resolve(output))
      .on("error", (err) => reject(err))
      .save(output)
  })
}

let handler = async (m, { conn, text }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""

  if (!/audio/.test(mime)) return m.reply("Balas audio/vn yang mau diubah temponya!\nContoh: .tempo 1.5")

  let speed = parseFloat(text)
  if (isNaN(speed) || speed < 0.5 || speed > 2.5) {
    return m.reply("Masukkan angka kecepatan 0.5 – 2.5\nContoh: .tempo 0.8 (lambat) | .tempo 2.0 (cepat)")
  }

  const wait = await conn.sendMessage(m.chat, { text: "Sedang proses tempo..." }, { quoted: m })

  let buffer
  try {
    buffer = await q.download()
  } catch {
    return conn.sendMessage(m.chat, { edit: wait.key, text: "Gagal download audio!" })
  }

  const tmp = join(tmpdir(), "tempo")
  if (!existsSync(tmp)) mkdirSync(tmp, { recursive: true })

  const input = join(tmp, `in_${Date.now()}.mp3`)
  const output = join(tmp, `out_${Date.now()}.mp3`)

  try {
    createWriteStream(input).write(buffer)
    await runFFmpeg(input, output, speed)

    await conn.sendMessage(m.chat, {
      audio: { url: output },
      ptt: false,
      mimetype: "audio/mpeg",
      fileName: "tempo.mp3",
      waveform: [0, 20, 40, 60, 80, 60, 40, 20, 0]
    }, { quoted: m })

    await conn.sendMessage(m.chat, { delete: wait.key })
  } catch (e) {
    console.log(e)
    await conn.sendMessage(m.chat, { edit: wait.key, text: "Gagal ubah tempo!" })
  } finally {
    [input, output].forEach(f => existsSync(f) && unlinkSync(f))
  }
}

handler.help = ["tempo <0.5-2.5>"]
handler.tags = ["voice"]
handler.command = /^tempo$/i
handler.limit = true

export default handler