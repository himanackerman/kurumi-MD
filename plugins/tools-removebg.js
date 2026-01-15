import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function removeBG(url) {
  try {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_url', url);

    let { data } = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': 'ibWgLJY2G4MB4m341iP7JVDT',
      },
      encoding: null
    })

    return { status: true, buffer: data}
  } catch(e) {
    return { status: false, msg: "Failed Request !" }
  }
}
let handler = async (m) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw 'No media found'
  let media = await q.download()
  let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
  let link = await (isTele ? uploadImage : uploadFile)(media)
  let url = await removeBG(link)
  conn.sendFile(m.chat, url.buffer, null, 'Done background has been deleted', m)
}
handler.help = ['rembg']
handler.tags = ['tools']
handler.command = /^(rembg|removebg)$/i
handler.limit = true
export default handler