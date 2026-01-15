/*
fitur: Terabox Downloader 
credit: ©AlfiXD
channel: https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
scrape: https://whatsapp.com/channel/0029Vb7AafUL7UVRIpg1Fy24/141
*/

import axios from 'axios';
import *as cheerio from 'cheerio';
import FormData from 'form-data';

class TeraBox {
  constructor() {
    this.BASE_URL = "https://terabxdownloader.org";
    this.AJAX_PATH = "/wp-admin/admin-ajax.php";
    this.HEADERS = {
      "accept": "*/*",
      "accept-language": "id-ID",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Referer": "https://terabxdownloader.org/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    this.CREATED_BY = "Ditzzy";
    this.NOTE = "Thank you for using this scrape, I hope you appreciate me for making this scrape by not deleting wm";
  }

  wrapResponse(data) {
    return {
      created_by: this.CREATED_BY,
      note: this.NOTE,
      results: data
    };
  }

  transformFolder(rawFolder) {
    return {
      name: rawFolder["📂 Name"],
      type: rawFolder["📋 Type"],
      size: rawFolder["📏 Size"]
    };
  }

  transformFile(rawFile) {
    return {
      name: rawFile["📂 Name"],
      type: rawFile["📋 Type"],
      fullPath: rawFile["📍 Full Path"],
      size: rawFile["📏 Size"],
      downloadLink: rawFile["🔽 Direct Download Link"]
    };
  }

  transformSummary(rawSummary) {
    return {
      totalFolders: rawSummary["📁 Total Folders"],
      totalFiles: rawSummary["📄 Total Files"],
      totalItems: rawSummary["🔢 Total Items"]
    };
  }

  extractData(rawResponse) {
    const rawData = rawResponse.data;

    return {
      folders: (rawData["📁 Folders"] || []).map(folder => this.transformFolder(folder)),
      files: (rawData["📄 Files"] || []).map(file => this.transformFile(file)),
      summary: rawData["📊 Summary"] 
        ? this.transformSummary(rawData["📊 Summary"])
        : { totalFolders: 0, totalFiles: 0, totalItems: 0 },
      shortlink: rawData["🔗 ShortLink"] || ""
    };
  }

  async getNonce() {
    const { data } = await axios.get(this.BASE_URL);

    const $ = cheerio.load(data);
    const nncSc = $('#jquery-core-js-extra').html();
    
    if (!nncSc) {
      throw new Error("Nonce script not found, Unable to continue.");
    }

    const match = nncSc.match(/"nonce"\s*:\s*"([^"]+)"/i);

    if (!match) {
      throw new Error('Nonce script found but Nonce value could not be found');
    }

    return match[1];
  }

  async download(url) {
    try {
      const nonce = await this.getNonce();

      const form = new FormData();
      form.append('action', 'terabox_fetch');
      form.append('url', url);
      form.append('nonce', nonce);

      const config = {
        url: this.BASE_URL + this.AJAX_PATH,
        method: "POST",
        headers: this.HEADERS,
        data: form
      };

      const { data } = await axios.request(config);
      const extractedData = this.extractData(data);

      return this.wrapResponse(extractedData);
    } catch (e) {
      throw new Error(`Error downloading from TeraBox: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} https://1024terabox.com/s/1hTspAuZCdy5vDAPiUOn3ig`
  
  m.reply('⏳ Sedang memproses link TeraBox, mohon tunggu...')
  
  try {
    const terabox = new TeraBox();
    const download = await terabox.download(text);
    
    if (!download.results || !download.results.files || download.results.files.length === 0) {
      throw new Error('Tidak ada file yang ditemukan atau link tidak valid');
    }
    
    let message = `📁 *TeraBox Downloader*\n\n`;
    message += `📊 *Summary:*\n`;
    message += `• Total Folder: ${download.results.summary.totalFolders}\n`;
    message += `• Total File: ${download.results.summary.totalFiles}\n`;
    message += `• Total Item: ${download.results.summary.totalItems}\n\n`;
    
    if (download.results.folders.length > 0) {
      message += `📂 *Folder:*\n`;
      download.results.folders.forEach((folder, index) => {
        message += `${index + 1}. ${folder.name} (${folder.size})\n`;
      });
      message += `\n`;
    }
    
    message += `📄 *File:*\n`;
    download.results.files.forEach((file, index) => {
      message += `${index + 1}. ${file.name} (${file.size})\n`;
    });
    
    await conn.sendMessage(m.chat, { text: message }, { quoted: m });

    const maxFiles = 5;
    const filesToSend = download.results.files.slice(0, maxFiles);
    
    for (const file of filesToSend) {
      try {
        const fileName = file.name.toLowerCase();
        let isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.avi') || fileName.endsWith('.mkv') || fileName.endsWith('.mov');
        let isImage = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif');
        let isAudio = fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.flac') || fileName.endsWith('.aac');
        
        if (isVideo) {
          await conn.sendMessage(m.chat, {
            video: { url: file.downloadLink },
            caption: `🎬 ${file.name}\n📏 Size: ${file.size}`
          }, { quoted: m });
        } else if (isImage) {
          await conn.sendMessage(m.chat, {
            image: { url: file.downloadLink },
            caption: `🖼️ ${file.name}\n📏 Size: ${file.size}`
          }, { quoted: m });
        } else if (isAudio) {
          await conn.sendMessage(m.chat, {
            audio: { url: file.downloadLink },
            mimetype: 'audio/mpeg',
            fileName: file.name
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            document: { url: file.downloadLink },
            fileName: file.name,
            mimetype: 'application/octet-stream'
          }, { quoted: m });
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`Error sending file ${file.name}:`, err);
      }
    }
    
    if (download.results.files.length > maxFiles) {
      await conn.sendMessage(m.chat, { 
        text: `⚠️ Hanya ${maxFiles} file pertama yang dikirim. Total ada ${download.results.files.length} file dalam link ini.` 
      }, { quoted: m });
    }
    
  } catch (e) {
    console.error('Error:', e)
    m.reply('🚨 Error: ' + (e.message || e))
  }
}

handler.help = ['terabox']
handler.tags = ['downloader']
handler.command = ['terabox', 'tb', 'teradl']
handler.limit = true

export default handler