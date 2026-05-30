import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
let res = [
"Kadang aku bertanya pada diriku sendiri, apakah aku yang terlalu berharap atau kamu yang memang tidak pernah peduli?",
"Melupakanmu itu sulit, seperti mencoba mengingat seseorang yang belum pernah kutemui.",
"Ternyata benar, melepaskan jauh lebih sulit daripada menggenggam.",
"Hanya karena aku tersenyum, bukan berarti aku bahagia. Terkadang, senyum hanyalah cara terbaik untuk menyembunyikan rasa sakit.",
"Aku berhenti berharap bukan karena aku tidak mencintaimu lagi, tapi karena aku sadar bahwa kamu tidak akan pernah melihatku.",
"Ada rasa yang tak pernah tersampaikan, ada rindu yang hanya bisa disimpan dalam diam.",
"Kamu adalah luka paling indah yang pernah aku rasakan.",
"Beberapa orang memang ditakdirkan untuk jatuh cinta, tapi tidak untuk bersama.",
"Aku tidak benci padamu, aku hanya kecewa karena kamu menjadi semua hal yang dulu kamu bilang tidak akan pernah kamu lakukan.",
"Pura-pura bahagia itu melelahkan, tapi menjelaskan mengapa aku sedih jauh lebih sulit.",
"Kehilanganmu bukan hanya tentang kehilangan seseorang, tapi tentang kehilangan bagian dari diriku sendiri.",
"Sakit itu ketika kamu melihat orang yang kamu cintai mencintai orang lain.",
"Mungkin aku hanyalah persinggahan bagimu, sementara bagiku kamu adalah tujuan.",
"Luka terdalam adalah luka yang tidak bisa dilihat oleh mata, dan rasa sakit terdalam adalah yang tidak bisa diucapkan oleh kata-kata.",
"Terima kasih telah mengajarkanku bahwa tidak semua orang yang datang akan menetap."
]
let quote = res[Math.floor(Math.random() * res.length)]
conn.reply(m.chat, quote, m)
}

handler.help = ['galau']
handler.tags = ['quotes']
handler.command = /^(galau|quotesgalau)$/i

export default handler