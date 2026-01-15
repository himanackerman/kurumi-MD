import similarity from 'similarity'
const threshold = 0.72 // semakin tinggi nilai, semakin mirip

export async function before(m) {
    this.game = this.game || {}
    let id = 'family100_' + m.chat
    if (!(id in this.game)) return !0

    let room = this.game[id]
    let text = m.text.toLowerCase().replace(/[^\w\s\-]+/g, '')
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)

    if (!isSurrender) {
        let index = room.jawaban.findIndex(j => j.toLowerCase() === text)

        if (index < 0) {
            const notAnswered = room.jawaban.filter((_, i) => !room.terjawab[i])
            const maxSim = Math.max(...notAnswered.map(j => similarity(j, text)))

            if (maxSim >= threshold) {
                await m.reply('Dikit lagi!')
            } else {
                room._lastWrong = room._lastWrong || {}
                if (room._lastWrong[m.sender] !== text) {
                    room._lastWrong[m.sender] = text
                    await m.reply('Salah!')
                }
            }
            return !0
        }

        if (room.terjawab[index]) {
            await m.reply('Jawaban itu sudah dijawab orang lain!')
            return !0
        }

        room.terjawab[index] = m.sender
        room._lastWrong && delete room._lastWrong[m.sender] // reset cache jika berhasil
        let users = global.db.data.users[m.sender]
        users.exp += room.winScore
        await m.reply('Benar!')
    }

    let isWin = room.terjawab.every(v => v)
    let caption = `
*Soal:* ${room.soal}
Terdapat *${room.jawaban.length}* jawaban${room.jawaban.find(v => v.includes(' ')) ? ` (beberapa jawaban terdapat spasi)` : ''}

${isWin ? `*SEMUA JAWABAN TERJAWAB*` : isSurrender ? '*MENYERAH!*' : ''}

${room.jawaban.map((jawaban, i) => {
        return room.terjawab[i] || isSurrender
            ? `(${i + 1}) ${jawaban} ${room.terjawab[i] ? '@' + room.terjawab[i].split('@')[0] : ''}`.trim()
            : false
    }).filter(Boolean).join('\n')}

${isSurrender ? '' : `+${room.winScore} XP tiap jawaban benar`}
    `.trim()

    const msg = await this.reply(m.chat, caption, null, {
        mentions: this.parseMention(caption)
    })

    room.msg = msg

    if (isWin || isSurrender) delete this.game[id]
    return !0
}