import axios from 'axios'
import canvafy from 'canvafy'

function durationToMs(duration = '0:00') {
  const [min, sec] = duration.split(':').map(Number)
  return (min * 60 + sec) * 1000
}

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('⚠️ Masukan link lagu Spotify!')

    // ambil detail lagu
    const { data: s } = await axios.get(
      `https://spotdown.org/api/song-details?url=${encodeURIComponent(text)}`,
      {
        headers: {
          origin: 'https://spotdown.org',
          referer: 'https://spotdown.org/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari/537.36'
        }
      }
    )

    const song = s?.songs?.[0]
    if (!song) return m.reply('❌ Gomene, lagu tidak ditemukan!')

    // download audio
    const { data: audio } = await axios.post(
      'https://spotdown.org/api/download',
      { url: song.url },
      {
        headers: {
          origin: 'https://spotdown.org',
          referer: 'https://spotdown.org/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari/537.36'
        },
        responseType: 'arraybuffer'
      }
    )

    const metadata = {
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      cover: song.thumbnail,
      url: song.url
    }

    const ms = durationToMs(metadata.duration)

    const caption = `
🎵 *SPOTIFY PLAY*

• *Title* : ${metadata.title}
• *Artist* : ${metadata.artist}
• *Duration* : ${metadata.duration}
• *Link* : ${metadata.url}
`.trim()

    // generate spotify canvas
    const spotifyCanvas = await new canvafy.Spotify()
      .setAuthor(metadata.artist || '')
      .setTitle(metadata.title || '')
      .setImage(metadata.cover || '')
      .setTimestamp(121000, ms || 0)
      .setBlur(5)
      .setOverlayOpacity(0.7)
      .build()

    // kirim cover
    const coverMsg = await conn.sendMessage(
      m.chat,
      { image: spotifyCanvas, caption },
      { quoted: m }
    )

    // kirim audio
    await conn.sendMessage(
      m.chat,
      {
        audio,
        mimetype: 'audio/mpeg'
      },
      { quoted: coverMsg }
    )
  } catch (e) {
    console.error(e)
    m.reply('❌ Gomene error, kemungkinan kebanyakan request.')
  }
}

handler.help = ['spotifyplay <link>', 'spotify-play <link>']
handler.tags = ['downloader']
handler.command = /^spotify(-)?play$/i
handler.limit = false

export default handler