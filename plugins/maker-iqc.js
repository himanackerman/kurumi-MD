/**
 ✧ FakeIphoneChat - maker ✧
 ───────────────────────────────
 𖣔 Type   : Plugin ESM
 𖣔 Source : https://whatsapp.com/channel/0029VbBDUSa90x2qZ82Niw2h
 𖣔 Create by : Lznycx
 𖣔 API    : https://brat.siputzx.my.id
*/

let handler = async (m, { text, command, conn, usedPrefix }) => {
    if (!text) 
        return m.reply(`*🧩 Masukkan teks!*\n*Contoh: ${usedPrefix + command} info kangg*`);

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        await conn.sendMessage(
            m.chat,
            {
                image: {
                    url: `https://brat.siputzx.my.id/iphone-quoted?time=12.00&batteryPercentage=90&carrierName=AXIS&messageText=${encodeURIComponent(text)}&emojiStyle=apple`
                },
                caption: '*✨ iPhone chat berhasil dibuat*'
            },
            { quoted: m }
        );
    } catch (err) {
        console.error(err);
        await m.reply('*🍂 Gagal membuat gambar. Coba lagi nanti.*');
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['iqc'];
handler.tags = ['maker'];
handler.command = /^(iqc|fakeiphonechat)$/i;
handler.limit = true;
handler.register = false;

export default handler;