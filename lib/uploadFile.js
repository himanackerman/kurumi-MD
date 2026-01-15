import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import path from 'path'

export default async function uploadFile(buffer, filename = 'file') {
  return new Promise(async (resolve, reject) => {
    try {
      const tmp = path.join(process.cwd(), 'tmp')
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

      const filePath = path.join(tmp, `${Date.now()}-${filename}`)
      fs.writeFileSync(filePath, buffer)

      const form = new FormData()
      form.append('file', fs.createReadStream(filePath))

      const { data } = await axios.post(
        'https://telegra.ph/upload',
        form,
        { headers: form.getHeaders() }
      )

      fs.unlinkSync(filePath)

      if (!data || !data[0]?.src) return reject('Upload gagal')

      resolve('https://telegra.ph' + data[0].src)
    } catch (e) {
      reject(e)
    }
  })
}