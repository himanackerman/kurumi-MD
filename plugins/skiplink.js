/*
fitur: skip link sub4unlock, tutwuri/sfl, ouo.io
credit: ©AlfiXD
channel: https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
*/

import axios from 'axios';


async function skipLink(url) {
    const apiKey = ''; // ambil apikey di https://fgsi.dpdns.org
    
    // Deteksi tipe shortlink dari URL
    let endpoint = '';
    
    if (url.includes('ouo.io')) {
        endpoint = 'ouo.io';
    } else if (url.includes('sfl.gl') || url.includes('safelinkblogger')) {
        endpoint = 'tutwuri';
    } else if (url.includes('subs4unlock.id')) {
        endpoint = 'sub4unlock';
    } else {
        throw new Error('URL tidak didukung. Hanya support: ouo.io, sfl.gl, subs4unlock.id');
    }
    
    try {
        const { data } = await axios.get(
            `https://fgsi.dpdns.org/api/tools/skip/${endpoint}?apikey=${apiKey}&url=${encodeURIComponent(url)}`,
            { timeout: 30000 }
        );
        
        if (!data.status) {
            throw new Error(data.message || 'Gagal bypass link');
        }
        
        return {
            success: true,
            type: endpoint,
            data: data.data
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw `❌ Masukkan URL shortlink!\n\n` +
              `Contoh:\n` +
              `${usedPrefix + command} https://ouo.io/ZH2ie7\n` +
              `${usedPrefix + command} https://sfl.gl/Tv7BqUhg\n` +
              `${usedPrefix + command} https://subs4unlock.id/kr8dJR\n\n` +
              `Support:\n• ouo.io\n• sfl.gl\n• subs4unlock.id`;
    }

    const loadingMsg = await conn.reply(m.chat, "⏳ Memproses bypass link...", m);

    try {
        const result = await skipLink(text);
        
        let responseText = `✅ *Link Berhasil Di-Bypass!*\n\n`;
        responseText += `🔗 *Tipe:* ${result.type}\n\n`;
        
        if (result.type === 'ouo.io') {
            responseText += `📥 *Direct Link:*\n${result.data}`;
            
        } else if (result.type === 'tutwuri') {
            responseText += `📥 *Final URL:*\n${result.data.url}\n\n`;
            if (result.data.message) {
                responseText += `💬 *Message:* ${result.data.message}`;
            }
            
        } else if (result.type === 'sub4unlock') {
            const info = result.data;
            responseText += `📝 *Info:*\n`;
            responseText += `∘ ID: ${info.id}\n`;
            responseText += `∘ Deskripsi: ${info.description}\n`;
            responseText += `∘ Dibuat: ${info.created_at}\n\n`;
            
            if (info.original) {
                const orig = info.original;
                if (orig['?ttl']) responseText += `∘ Title: ${orig['?ttl']}\n`;
                if (orig.sttl) responseText += `∘ Subtitle: ${orig.sttl}\n`;
                if (orig.yt) responseText += `∘ YouTube: ${orig.yt}\n`;
                if (orig.wa) responseText += `∘ WhatsApp: ${orig.wa}\n`;
                if (orig.ig) responseText += `∘ Instagram: ${orig.ig}\n`;
                responseText += `\n`;
            }
            
            responseText += `📥 *Direct Link:*\n${info.linkGo}`;
        }

        await conn.sendMessage(m.chat, {
            text: responseText,
            edit: loadingMsg.key
        }).catch(() => conn.reply(m.chat, responseText, m));

    } catch (e) {
        try {
            if (loadingMsg?.key) await conn.sendMessage(m.chat, { delete: loadingMsg.key });
        } catch {}
        
        return conn.reply(
            m.chat,
            `❌ *Terjadi kesalahan*\n\n${e.message || e}\n\n_Pastikan URL valid dan didukung._`,
            m
        );
    }
};

handler.command = ["skiplink"];
handler.help = ["skiplink <url>"];
handler.tags = ["tools"];
handler.limit = true;
handler.premium = false;

export default handler;