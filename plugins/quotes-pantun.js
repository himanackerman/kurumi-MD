let handler = async (m, { conn, text, args, usedPrefix, command }) => {
let pantun = [
"Masak air di dalam panci,\nAir mendidih buat seduh kopi.\nKalau kamu punya janji,\nHarus segera ditepati.",
"Beli mangga di pasar baru,\nMangganya manis banyak seratnya.\nKalau kamu ingin maju,\nJangan malas untuk bekerja.",
"Jalan-jalan ke kota Tua,\nJangan lupa beli kacamata.\nMari kita saling menyapa,\nAgar terjalin tali saudara.",
"Pagi hari makan ketupat,\nSayur nangka enak rasanya.\nJangan lupa sholat tepat,\nAgar berkah hidup selamanya.",
"Pohon mangga berbuah lebat,\nSayang dahan banyak semutnya.\nKalau ingin jadi hebat,\nBelajar giat itu kuncinya.",
"Ke pasar beli ikan asin,\nPulang-pulang bawa pepaya.\nKalau kamu orang rajin,\nTentu akan cepat kaya.",
"Burung dara burung merpati,\nTerbang tinggi ke awan biru.\nJangan suka rendah diri,\nTunjukkan bakat yang kamu tahu.",
"Beli buku di toko buku,\nBuku tulis gambar kelapa.\nKalau rindu padaku,\nJangan lupa kirimkan sapa.",
"Ke sekolah naik sepeda,\nSepeda baru warna merah.\nJangan sia-siakan masa muda,\nAgar tua tidak menyerah.",
"Pergi ke hutan cari rotan,\nRotan dijalin jadi kursi.\nMari kita jaga kebersihan,\nAgar lingkungan tetap asri."
]
let result = pantun[Math.floor(Math.random() * pantun.length)]
conn.reply(m.chat, result, m)
}
handler.help = ['pantun']
handler.tags = ['quotes']
handler.command = /^(pantun)$/i
export default handler