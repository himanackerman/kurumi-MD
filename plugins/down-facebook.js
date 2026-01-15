/* 
fitur: fesnuk downloader
cr: https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
skrep: https://whatsapp.com/channel/0029Vap84RE8KMqfYnd0V41A/3625
*/

import axios from 'axios'
import *as cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} <link video Facebook>`
  
  try {
    m.reply('wett...')
    
    const r = await axios.post('https://v3.fdownloader.net/api/ajaxSearch',
      new URLSearchParams({
        q: text,
        lang: 'en',
        web: 'fdownloader.net',
        v: 'v2',
        w: ''
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          origin: 'https://fdownloader.net',
          referer: 'https://fdownloader.net/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10)'
        }
      }
    )

    const $ = cheerio.load(r.data.data)
    
    const duration = $('.content p').first().text().trim() || null
    const thumbnail = $('.thumbnail img').attr('src') || null
    const videos = $('.download-link-fb').map((_, el) => ({
      quality: $(el).attr('title')?.replace('Download ', '') || '',
      url: $(el).attr('href')
    })).get()

    if (!videos || videos.length === 0) {
      throw new Error('Tidak ada video ditemukan')
    }

    const selectedVideo = videos.find(v => v.quality.includes('720p')) || videos[0]
    
    await conn.sendMessage(m.chat, {
      video: { url: selectedVideo.url },
      caption: `*Facebook Downloader*\n\n📹 Durasi: ${duration}\n📊 Kualitas: ${selectedVideo.quality}`,
      mimetype: 'video/mp4'
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error:', e)
    m.reply('🚨 Error: ' + (e.message || e))
  }
}

handler.help = ['facebook', 'fbdl', 'fb']
handler.tags = ['downloader']
handler.command = /^(facebook|fbdl|fb)$/i
handler.limit = true

export default handler