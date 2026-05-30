import os from 'os'
import moment from 'moment-timezone'
import { performance } from 'perf_hooks'
import { getImageProcessingLibrary } from 'baileys'

const lib = await getImageProcessingLibrary()

let handler = async (m, { conn }) => {

  const old = performance.now()

  await conn.sendPresenceUpdate('composing', m.chat)

  const speed = (performance.now() - old).toFixed(2)

  const uptime = process.uptime() * 1000

  const format = ms => {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return `${h}h ${m}m ${s}s`
  }

  const ramUsed = (
    process.memoryUsage().heapUsed /
    1024 /
    1024
  ).toFixed(2)

  const ramTotal = (
    os.totalmem() /
    1024 /
    1024 /
    1024
  ).toFixed(1)

  const cpu = os.cpus()[0].model

  const cpuWords = cpu.split(' ')

  const cpuLine1 = cpuWords
    .slice(0, 4)
    .join(' ')

  const cpuLine2 = cpuWords
    .slice(4)
    .join(' ')

  const users = Object.keys(
    global.db.data.users || {}
  ).length

  const groups = Object.keys(
    global.db.data.chats || {}
  ).filter(v => v.endsWith('@g.us')).length

  const premium = Object.values(
    global.db.data.users || {}
  ).filter(v => v.premiumTime > Date.now()).length

  const time = moment()
    .tz('Asia/Jakarta')
    .format('DD MMM YYYY • HH:mm:ss')

  const svg = `
<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">

<defs>

<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#09090f"/>
<stop offset="50%" stop-color="#12071f"/>
<stop offset="100%" stop-color="#031525"/>
</linearGradient>

<filter id="glow">
<feGaussianBlur stdDeviation="8" result="blur"/>
<feMerge>
<feMergeNode in="blur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>

<style>

.title {
fill: white;
font-size: 56px;
font-family: monospace;
font-weight: bold;
}

.small {
fill: #94a3b8;
font-size: 22px;
font-family: monospace;
}

.label {
font-size: 28px;
font-family: monospace;
font-weight: bold;
}

.value {
fill: white;
font-size: 46px;
font-family: monospace;
font-weight: bold;
}

.cpuText {
fill: white;
font-size: 28px;
font-family: monospace;
font-weight: bold;
}

.card {
fill: rgba(10,10,15,0.72);
stroke-width: 3;
rx: 30;
ry: 30;
}

</style>

</defs>

<rect width="100%" height="100%" fill="url(#bg)"/>

<!-- HEADER -->

<text
x="60"
y="90"
class="title"
filter="url(#glow)">
KURUMI SYSTEM
</text>

<text
x="60"
y="130"
class="small">
${time}
</text>

<!-- SPEED -->

<rect
x="60"
y="190"
width="450"
height="180"
class="card"
stroke="#00e5ff"/>

<text
x="90"
y="250"
class="label"
fill="#00e5ff">
SPEED
</text>

<text
x="90"
y="330"
class="value">
${speed} ms
</text>

<!-- RAM -->

<rect
x="575"
y="190"
width="450"
height="180"
class="card"
stroke="#a855f7"/>

<text
x="605"
y="250"
class="label"
fill="#c084fc">
RAM
</text>

<text
x="605"
y="330"
class="value">
${ramUsed} MB
</text>

<!-- UPTIME -->

<rect
x="1090"
y="190"
width="450"
height="180"
class="card"
stroke="#ff4fd8"/>

<text
x="1120"
y="250"
class="label"
fill="#ff4fd8">
UPTIME
</text>

<text
x="1120"
y="330"
class="value">
${format(uptime)}
</text>

<!-- CPU -->

<rect
x="60"
y="430"
width="720"
height="220"
class="card"
stroke="#00e5ff"/>

<text
x="95"
y="490"
class="label"
fill="#00e5ff">
CPU
</text>

<text
x="95"
y="550"
class="cpuText">
${cpuLine1}
</text>

<text
x="95"
y="595"
class="cpuText">
${cpuLine2}
</text>

<text
x="95"
y="640"
class="small">
${os.cpus().length} CORES
</text>

<!-- MEMORY -->

<rect
x="820"
y="430"
width="720"
height="220"
class="card"
stroke="#ffd93d"/>

<text
x="855"
y="490"
class="label"
fill="#ffd93d">
MEMORY
</text>

<text
x="855"
y="560"
class="value">
${ramTotal} GB
</text>

<text
x="855"
y="620"
class="small">
SYSTEM MEMORY
</text>

<!-- DATABASE -->

<rect
x="60"
y="710"
width="1480"
height="150"
class="card"
stroke="#22c55e"/>

<text
x="95"
y="775"
class="label"
fill="#22c55e">
DATABASE
</text>

<text
x="95"
y="835"
class="value"
font-size="36">
USERS ${users} • GROUPS ${groups} • PREMIUM ${premium}
</text>

</svg>
`

  let image = await lib.sharp
    .default(Buffer.from(svg))
    .png()
    .toBuffer()

  let caption = `
— info ping —

❀ speed : ${speed} ms
❀ runtime : ${format(uptime)}
❀ ram : ${ramUsed} MB
❀ users : ${users}
❀ groups : ${groups}
❀ premium : ${premium}
`.trim()

  await conn.sendMessage(
    m.chat,
    {
      image,
      caption
    },
    { quoted: m }
  )
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping|speed)$/i

export default handler