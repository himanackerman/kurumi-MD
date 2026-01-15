import axios from "axios";
import cheerio from "cheerio";

const baseUrl = "https://otakudesu.cloud";

async function latestAnime() {
    try {
        const url = `${baseUrl}/ongoing-anime/`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let animeList = [];

        $(".venz ul li").each((i, elem) => {
            const title = $(elem).find("h2.jdlflm").text().trim();
            const episode = $(elem).find(".epz").text().replace("Episode ", "").trim();
            const releaseDay = $(elem).find(".epztipe").text().trim();
            const releaseDate = $(elem).find(".newnime").text().trim();
            const image = $(elem).find(".thumbz img").attr("src");
            const link = $(elem).find(".thumb a").attr("href");

            animeList.push({ title, episode, releaseDay, releaseDate, image, link });
        });

        return animeList;
    } catch {
        return { error: "Gagal mengambil data anime terbaru." };
    }
}

async function animeDetail(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('title').text().split('|')[0].trim();
        const description = $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        const publishedTime = $('meta[property="article:published_time"]').attr('content');
        const modifiedTime = $('meta[property="article:modified_time"]').attr('content');

        // Perbaikan dengan regex agar label tidak duplikat
        const titleJapanese = $('p:contains("Japanese")').text().replace(/^Japanese\s*:\s*/, '').trim();
        const score = $('p:contains("Skor")').text().replace(/^Skor\s*:\s*/, '').trim();
        const rating = $('p:contains("Rating")').text().replace(/^Rating\s*:\s*/, '').trim();
        const producer = $('p:contains("Produser")').text().replace(/^Produser\s*:\s*/, '').trim();
        const type = $('p:contains("Tipe")').text().replace(/^Tipe\s*:\s*/, '').trim();
        const status = $('p:contains("Status")').text().replace(/^Status\s*:\s*/, '').trim();
        const totalEpisodes = $('p:contains("Total Episode")').text().replace(/^Total Episode\s*:\s*/, '').trim();
        const duration = $('p:contains("Durasi")').text().replace(/^Durasi\s*:\s*/, '').trim();
        const releaseDate = $('p:contains("Tanggal Rilis")').text().replace(/^Tanggal Rilis\s*:\s*/, '').trim();
        const studio = $('p:contains("Studio")').text().replace(/^Studio\s*:\s*/, '').trim();
        const genres = $('p:contains("Genre") a').map((i, el) => $(el).text().trim()).get().join(', ');
        const synopsis = $('.sinopc p').map((i, el) => $(el).text().trim()).get().join(' ');

        return { 
            title, titleJapanese, description, image, publishedTime, modifiedTime, 
            score, rating, producer, type, status, totalEpisodes, duration, 
            releaseDate, studio, genres, synopsis, url 
        };
    } catch {
        return { error: "Gagal mengambil data." };
    }
}

async function searchAnime(query) {
    try {
        const searchUrl = `${baseUrl}/?s=${encodeURIComponent(query)}&post_type=anime`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.chivsrc > li').each((i, el) => {
            const image = $(el).find('img').attr('src');
            const title = $(el).find('h2 a').text().trim();
            const url = $(el).find('h2 a').attr('href');
            const genres = [];
            $(el).find('.set').eq(0).find('a').each((_, genre) => {
                genres.push($(genre).text().trim());
            });
            const status = $(el).find('.set').eq(1).text().replace(/^Status\s*:\s*/, '').trim();
            const rating = $(el).find('.set').eq(2).text().replace(/^Rating\s*:\s*/, '').trim();

            if (title && url) {
                results.push({ title, url, image, genres, status, rating });
            }
        });

        return results;
    } catch {
        return { error: "Gagal mengambil data, coba lagi nanti." };
    }
}

const handler = async (m, { conn, command, args }) => {
    if (command === "otakudesu") {
        if (!args.length) {
            return m.reply("Gunakan format :\n- *otakudesu latest* : Anime terbaru\n- *otakudesu search <judul>* : Cari anime\n- *otakudesu detail <url>* : Detail anime");
        } else if (args[0] === "latest") {
            let data = await latestAnime();
            if (data.error) return m.reply(data.error);

            let message = "Anime Terbaru : \n\n";
            data.slice(0, 10).forEach((anime, i) => {
                message += `${i + 1}. ${anime.title}\nEpisode : ${anime.episode}\nRilis : ${anime.releaseDate}\nLink : ${anime.link}\n\n`;
            });

            return m.reply(message);
        } else if (args[0] === "search") {
            if (!args[1]) return m.reply("Masukkan judul anime yang ingin dicari.");
            let data = await searchAnime(args.slice(1).join(" "));
            if (data.error) return m.reply(data.error);

            let message = "Hasil Pencarian : \n\n";
            data.slice(0, 10).forEach((anime, i) => {
                message += `${i + 1}. ${anime.title}\nStatus : ${anime.status}\nRating : ${anime.rating}\nLink : ${anime.url}\n\n`;
            });

            return m.reply(message);
        } else if (args[0] === "detail") {
            if (!args[1]) return m.reply("Masukkan URL anime dari Otakudesu.");
            let data = await animeDetail(args[1]);
            if (data.error) return m.reply(data.error);

            let message = `*Judul :* ${data.title}\n\n*Japanese :* ${data.titleJapanese}\n\n*Skor :* ${data.score}\n\n*Studio :* ${data.studio}\n*Release Date :* ${data.releaseDate}\n\n*Total Episode :* ${data.totalEpisodes}\n\n*Genre :* ${data.genres}\n\n*Sinopsis :* ${data.synopsis.slice(0, 500)}...\n\n*Link :* ${data.url}`;

            await conn.sendMessage(m.chat, { image: { url: data.image }, caption: message }, { quoted: m });
        } else {
            return m.reply("Gunakan format yang benar.");
        }
    }
};

handler.help = ["otakudesu"];
handler.command = ["otakudesu"];
handler.tags = ["anime"];

export default handler;