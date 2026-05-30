import fetch from 'node-fetch';
import fs from 'fs';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    conn.slots = conn.slots || {};
    let user = global.db.data.users[m.sender];

    if (m.chat in conn.slots) return m.reply('Masih ada permainan slot berlangsung di sini. Tunggu sampai selesai!');
    conn.slots[m.chat] = true;

    try {
        if (args.length < 1 || isNaN(args[0]) || args[0] <= 0) {
            return m.reply(`Gunakan format *${usedPrefix}${command} [jumlah]*, dan jumlah harus angka positif.`);
        }

        let count = parseInt(args[0]);
        if (user.money < count) throw 'Uang kamu tidak cukup.';

        let symbols = ['🍊', '🍇', '🍉', '🍌', '🍍'];
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Kirim pesan awal
        let initialMessage = await conn.sendMessage(m.chat, { 
            text: '*🎰 VIRTUAL SLOTS 🎰*\n\nMemulai permainan... Tunggu sebentar!' 
        }, { quoted: m });

        // Animasi slot acak (20 kali)
        for (let i = 0; i < 20; i++) { // Diubah dari 3 ke 20 iterasi
            let randomText = symbols.map(() => pickRandom(symbols)).join('|');
            await sleep(1000); // Tunggu 1 detik setiap iterasi
            await conn.sendMessage(m.chat, { 
                text: `*🎰 VIRTUAL SLOTS 🎰*\n\nStatus: ${randomText}`, 
                edit: initialMessage.key // Gunakan metode ini untuk menyimulasikan edit
            });
        }

        // Tambahkan delay 2 detik sebelum hasil akhir
        await sleep(2000);

        // Hasil akhir slot
        let spins = Array.from({ length: 9 }, () => pickRandom(symbols));
        user.money -= count;

        let resultMessage = `*🎰 VIRTUAL SLOTS 🎰*\n\n${spins.slice(0, 3).join('|')}\n${spins.slice(3, 6).join('|')} <<==\n${spins.slice(6).join('|')}`;

        let winMessage;
        let reward = 0;

        if (new Set(spins).size === 1) { // Semua simbol sama
            winMessage = 'BIG JACKPOT 🥳🥳';
            reward = count * 4;
        } else if (spins[3] === spins[4] && spins[4] === spins[5]) { // Baris tengah sama
            winMessage = 'JACKPOT 🥳';
            reward = count * 2;
        } else if ((spins[0] === spins[1] && spins[1] === spins[2]) || (spins[6] === spins[7] && spins[7] === spins[8])) { // Baris atas/bawah sama
            winMessage = 'DIKIT LAGI!!';
        } else {
            winMessage = 'YOU LOSE';
        }

        user.money += reward;
        resultMessage += `\n\n*${winMessage}* ${reward > 0 ? `+${reward}` : `-${count}`}\nSaldo: ${user.money}`;

        // Kirim hasil akhir
        await conn.sendMessage(m.chat, { 
            text: resultMessage,
            edit: initialMessage.key // Ganti pesan lama dengan pesan hasil akhir
        });

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, 'Terjadi kesalahan, coba lagi nanti.', m);
    } finally {
        delete conn.slots[m.chat];
    }
};

handler.help = ['slot', 'jackpot']
handler.tags = ['game']
handler.command = /^slots?|jac?kpot$/i

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}