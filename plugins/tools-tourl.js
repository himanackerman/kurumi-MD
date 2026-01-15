import axios from "axios"
import FormData from "form-data"

const uploadDeline = async (buffer, ext = "bin", mime = "application/octet-stream") => {
  const fd = new FormData()
  fd.append("file", buffer, { filename: `file.${ext}`, contentType: mime })

  const res = await axios.post("https://api.deline.web.id/uploader", fd, {
    headers: fd.getHeaders(),
    maxBodyLength: 50 * 1024 * 1024,
    maxContentLength: 50 * 1024 * 1024,
    timeout: 60000
  })

  const data = res.data || {}
  if (data.status === false) {
    throw new Error(data.message || data.error || "Upload failed")
  }

  const link = data?.result?.link || data?.url || data?.path
  if (!link) throw new Error("Invalid response (no link found)")
  return link
}

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ""

    if (!mime) return m.reply("Reply / kirim media lalu ketik .tourl atau .tolink")

    let buffer = await q.download()
    if (!buffer) return m.reply("Gagal download media.")

    let ext = mime.split("/")[1] || "bin"

    let link = await uploadDeline(buffer, ext, mime)

    await conn.sendMessage(
      m.chat,
      { text: `🔗 *LINK HASIL UPLOAD*\n\n${link}`, ...global.adReply },
      { quoted: m }
    )
  } catch (e) {
    console.error("TOURL ERROR:", e)
    m.reply("❌ Gagal upload ke server.\n" + e.message)
  }
}

handler.help = ["tourl", "tolink"]
handler.tags = ["tools"]
handler.command = /^(tourl|tolink)$/i
handler.limit = true

export default handler