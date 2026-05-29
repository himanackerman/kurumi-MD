let handler = async (m, { text }) => {
  if (!text) return m.reply('Masukkan pertanyaan!')

  await m.react('🕒')

  try {
    const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    })

    const data = await response.json()

    if (!data.success) return m.reply('Gagal mendapatkan respons!')

    await m.reply(data.result.answer)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    await m.reply('Error: ' + e.message)
  }
}

handler.help = ['gemini']
handler.tags = ['ai']
handler.command = ['gemini', 'ai']

export default handler