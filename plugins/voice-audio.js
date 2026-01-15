import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/audio/.test(mime)) {
    return m.reply(`Balas vn atau audio dengan caption ${usedPrefix + command}`)
  }

  let audio = await q.download()
  if (!audio) return m.reply('Gagal mengunduh audio')

  let set = null

  if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30'
  else if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log'
  else if (/deep/.test(command)) set = '-af atempo=1,asetrate=44500*2/3'
  else if (/earrape/.test(command)) set = '-af volume=12'
  else if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"'
  else if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"'
  else if (/nightcore/.test(command)) set = '-filter:a "atempo=1.06,asetrate=44100*1.25"'
  else if (/reverse/.test(command)) set = '-filter_complex "areverse"'
  else if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'
  else if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"'
  else if (/smooth/.test(command)) set = '-filter:v "minterpolate=mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120"'
  else if (/tupai|squirrel|chipmunk/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"'
  else if (/vibra/.test(command)) set = '-filter_complex "vibrato=f=15"'

  if (!set) return m.reply('Efek tidak dikenali')

  let tmp = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

  let input = path.join(tmp, Date.now() + '.mp3')
  let output = input + '.out.mp3'

  await fs.promises.writeFile(input, audio)

  exec(`ffmpeg -i "${input}" ${set} "${output}"`, async err => {
    await fs.promises.unlink(input).catch(() => {})
    if (err) return m.reply('Gagal memproses audio')

    let buff = await fs.promises.readFile(output)
    await conn.sendFile(
      m.chat,
      buff,
      'audio.mp3',
      null,
      m,
      /vn/.test(args[0]),
      { mimetype: 'audio/mp4' }
    )

    await fs.promises.unlink(output).catch(() => {})
  })
}

handler.help = [
  'bass',
  'blown',
  'deep',
  'earrape',
  'fast',
  'fat',
  'nightcore',
  'reverse',
  'robot',
  'slow',
  'smooth',
  'tupai',
  'vibra'
].map(v => `${v} [vn]`)

handler.tags = ['voice']
handler.command = /^(bass|blown|deep|earrape|fas?t|fat|nightcore|reverse|robot|slow|smooth|tupai|squirrel|chipmunk|vibra)$/i

export default handler