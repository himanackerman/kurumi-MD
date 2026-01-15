import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `*Format salah!*\n\nGunakan:\n_${usedPrefix + command} <link>_`
    )

  if (!text.includes("https://"))
    return m.reply("❌ URL tidak valid")

  m.reply("_Sedang memproses media, mohon tunggu..._")

  try {
    const result = await downr(text)
    
    if (!result || !result.medias || result.medias.length === 0)
      return m.reply("❌ Media tidak ditemukan")

    const media = result.medias[0]
    const url = media.url
    const ext = media.extension || "mp4"

    const isVideo = ext === "mp4"
    const isAudio = ext === "mp3"

    await conn.sendMessage(
      m.chat,
      {
        [isVideo ? "video" : isAudio ? "audio" : "document"]: { url },
        mimetype: isVideo
          ? "video/mp4"
          : isAudio
          ? "audio/mpeg"
          : "application/octet-stream",
        fileName: `downr.${ext}`,
        caption:
          `✅ *Download Berhasil*\n\n` +
          `📌 Judul: ${result.title || "-"}\n` +
          `📎 Format: ${ext.toUpperCase()}`
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal memproses media.")
  }
}

handler.help = ["aio <url>"]
handler.tags = ["downloader"]
handler.command = /^aio$/i
handler.limit = true

export default handler

async function downr(url) {
  try {
    if (!url.includes("https://"))
      throw new Error("Invalid url.")

    const { headers } = await axios.get(
      "https://downr.org/.netlify/functions/analytics",
      {
        headers: {
          referer: "https://downr.org/",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36"
        }
      }
    )

    const { data } = await axios.post(
      "https://downr.org/.netlify/functions/download",
      { url },
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "content-type": "application/json",
          cookie: headers["set-cookie"]?.join("; ") || "",
          origin: "https://downr.org",
          referer: "https://downr.org/",
          "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36"
        }
      }
    )

    return data // ⬅️ MENTAH, TIDAK DIUBAH
  } catch (error) {
    throw new Error(error.message)
  }
}