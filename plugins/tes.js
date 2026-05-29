let handler = async (m) => {

let ytta =`*Y*`
await m.reply(ytta)
}
handler.customPrefix = /^(tes|bot|test)$/i
handler.command = new RegExp
export default handler