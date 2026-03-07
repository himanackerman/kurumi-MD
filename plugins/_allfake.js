import fs from 'fs'
import moment from 'moment-timezone'
import path from 'path'

let handler = m => m

handler.all = async function (m, { __dirname }) {

  global.wm = '❀ ᴋᴜʀᴜᴍɪ ᴍᴅ ❀'

  if (!global.thumb) {
    try {
      global.thumb = fs.readFileSync(
        path.resolve(__dirname, '../media/thumbnail.jpg')
      )
    } catch {
      console.log('media/thumbnail.jpg tidak ditemukan!')
      global.thumb = null
    }
  }

  const thumb = global.thumb

  global.adReply = {
    contextInfo: {
      forwardingScore: 100,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: '「 ᴋᴜʀᴜᴍɪ ᴍᴅ 」',
        newsletterJid: '120363395114168746@newsletter'
      },
      externalAdReply: {
        title: global.wm,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://github.com/himanackerman'
      }
    }
  }

  global.fkontak = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: m.chat
    },
    message: {
      contactMessage: {
        displayName: global.wm,
        vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;${global.wm},;;;
FN:${global.wm}
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`,
        jpegThumbnail: thumb
      }
    }
  }

  const metaName = 'Meta AI'
  const metaNumber = '13135550002'
  const metaJid = metaNumber + '@s.whatsapp.net'

  let metaThumb
  try {
    metaThumb = await this.profilePictureUrl(metaJid, 'image')
  } catch {
    metaThumb = thumb
  }

  global.fmeta = {
    key: {
      fromMe: false,
      participant: metaJid,
      remoteJid: m.chat,
      id: 'META_AI'
    },
    message: {
      contactMessage: {
        displayName: metaName,
        vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;${metaName},;;;
FN:${metaName}
item1.TEL;waid=${metaNumber}:${metaNumber}
item1.X-ABLabel:Meta AI
END:VCARD`,
        jpegThumbnail: metaThumb
      }
    },
    pushName: metaName,
    messageTimestamp: Math.floor(Date.now() / 1000)
  }

  global.fvn = {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      audioMessage: {
        mimetype: 'audio/ogg; codecs=opus',
        seconds: '999999',
        ptt: true
      }
    }
  }

  global.ftextt = {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      extendedTextMessage: {
        text: global.wm,
        title: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  global.fgif = {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      videoMessage: {
        title: global.wm,
        seconds: '999',
        gifPlayback: true,
        caption: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  global.ftoko = {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      productMessage: {
        product: {
          productImage: {
            mimetype: 'image/jpeg',
            jpegThumbnail: thumb
          },
          title: global.wm,
          description: 'Anime Assistant',
          currencyCode: 'IDR',
          priceAmount1000: '20000000',
          retailerId: 'Kurumi MD',
          productImageCount: 1
        },
        businessOwnerJid: '0@s.whatsapp.net'
      }
    }
  }

  global.fdocs = {
    key: { participant: '0@s.whatsapp.net' },
    message: {
      documentMessage: {
        title: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  global.fstatus = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'KurumiMD'
    },
    message: {
      locationMessage: {
        name: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  if (!this._autoAdReplyPatched) {
    this._autoAdReplyPatched = true

    const originalSend = this.sendMessage.bind(this)

    this.sendMessage = async (jid, msg = {}, opt = {}) => {

      if (
        msg &&
        typeof msg === 'object' &&
        !msg.contextInfo &&
        !msg.image &&
        !msg.video &&
        !msg.audio &&
        !msg.document
      ) {
        msg.contextInfo = global.adReply.contextInfo
      }

      return originalSend(jid, msg, opt)
    }
  }
}

export default handler

function momentGreeting() {
  const hour = moment.tz('Asia/Jakarta').hour()

  if (hour >= 18) return '🌙 Konbanwa'
  if (hour >= 15) return '🌆 Konnichiwa'
  if (hour >= 10) return '☀️ Ohayou'
  return '✨ Oyasumi'
}