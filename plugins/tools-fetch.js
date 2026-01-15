import axios from "axios"
import path from "path"

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Masukkan URL\nContoh: .fetch https://example.com")
    if (!/^https?:\/\//i.test(text)) return m.reply("URL harus diawali http:// atau https://")

    try {
        const res = await axios.get(text, {
            responseType: "arraybuffer",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Referer": text,
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": "Mozilla/5.0"
            }
        })

        const type = res.headers["content-type"] || ""
        const length = Number(res.headers["content-length"] || 1024)
        const size = formatSize(length)

        if (isOversize(size, "200MB")) {
            return m.reply(`File terlalu besar\nUkuran: ${size}`)
        }

        if (/application\/json/i.test(type)) {
            return m.reply(JSON.stringify(JSON.parse(res.data.toString()), null, 2))
        }

        if (/text\//i.test(type)) {
            return m.reply(res.data.toString())
        }

        if (/image\/|video\/|audio\//i.test(type)) {
            return conn.sendFile(m.chat, res.data, "", "", m)
        }

        let ext = getExt(type) || path.extname(text) || ".bin"
        let filename = `result${ext}`

        return conn.sendMessage(
            m.chat,
            {
                document: res.data,
                fileName: filename,
                mimetype: type || "application/octet-stream"
            },
            { quoted: m }
        )
    } catch (e) {
        return m.reply("Gagal mengambil data")
    }
}

handler.help = ["fetch <url>"]
handler.tags = ["tools"]
handler.command = /^(fet|fetch|get)$/i
handler.owner = false

export default handler

function formatSize(bytes) {
    const units = ["Bytes", "KB", "MB", "GB"]
    let i = 0
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024
        i++
    }
    return `${bytes.toFixed(2)} ${units[i]}`
}

function isOversize(size, limit) {
    const toBytes = s => {
        let [num, unit] = s.split(" ")
        const map = { Bytes: 1, KB: 1024, MB: 1048576, GB: 1073741824 }
        return Number(num) * map[unit]
    }
    return toBytes(size) > toBytes(limit)
}

function getExt(type) {
    const map = {
        "application/pdf": ".pdf",
        "application/zip": ".zip",
        "application/x-rar-compressed": ".rar",
        "application/vnd.android.package-archive": ".apk",
        "application/javascript": ".js",
        "text/html": ".html"
    }
    return map[type]
}