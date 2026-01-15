/**
  *» Nama :* — [ TEXT TO IMAGE - AI ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://www.createimg.com
  *» Saluran :* https://whatsapp.com/channel/0029Vb7XfVV2v1IzPVqjgq37
  *» Creator :* -Ɗαnčoᴡ々
**/

import fetch from 'node-fetch';

const API_BASE = 'https://www.createimg.com?api=v1';

class CreateImgAPI {
  constructor() {
    this.token = null;
    this.security = null;
    this.server = null;
  }

  generateSecurity() {
    return Array.from({length: 32}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async initialize() {
    const cfToken = await bypassTurnstile();
    this.security = this.generateSecurity();
    
    const params = new URLSearchParams({
      token: cfToken,
      security: this.security,
      action: 'turnstile',
      module: 'create'
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    const data = await res.json();
    if (!data.status) throw new Error('Inisialisasi gagal');

    this.token = cfToken;
    this.server = data.server;
    return data;
  }

  async create(prompt, options = {}) {
    if (!this.token) await this.initialize();

    const params = new URLSearchParams({
      token: this.token,
      security: this.security,
      action: 'create',
      server: this.server,
      prompt: prompt,
      negative: options.negative || '',
      seed: options.seed || Math.floor(Math.random() * 1000000000),
      size: options.size || 1024
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async checkQueue(id, queue) {
    const params = new URLSearchParams({
      id,
      queue,
      module: 'create',
      action: 'queue',
      server: this.server,
      token: this.token,
      security: this.security
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async getHistory(id) {
    const params = new URLSearchParams({
      id,
      action: 'history',
      server: this.server,
      module: 'create',
      token: this.token,
      security: this.security
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async getOutput(filename) {
    const params = new URLSearchParams({
      id: filename,
      action: 'output',
      server: this.server,
      module: 'create',
      token: this.token,
      security: this.security,
      page: 'home',
      lang: 'en'
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async generate(prompt, options = {}) {
    const createRes = await this.create(prompt, options);
    if (!createRes.status) throw new Error('Create failed');

    const { id, queue } = createRes;
    
    let pending = 1;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (pending > 0 && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
      const queueRes = await this.checkQueue(id, queue);
      pending = queueRes.pending || 0;
    }

    if (attempts >= maxAttempts) throw new Error('Timeout');

    const historyRes = await this.getHistory(id);
    if (!historyRes.status) throw new Error('History failed');

    const outputRes = await this.getOutput(historyRes.file);
    if (!outputRes.status) throw new Error('Output failed');

    return {
      id,
      filename: historyRes.file,
      data: outputRes.data
    };
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*Contoh:* ${usedPrefix + command} a beautiful girl`;

  await m.reply('*Sedang generate gambar...*');

  try {
    const api = new CreateImgAPI();
    const result = await api.generate(text);

    await conn.sendMessage(m.chat, {
      image: { url: result.data },
      caption: `*Prompt:* ${text}`
    }, { quoted: m });

  } catch (e) {
    throw `Error: ${e.message}`;
  }
};

handler.help = ['createimg'];
handler.tags = ['ai'];
handler.command = /^(createimg)$/i;

export default handler;

async function bypassTurnstile() {
  const url = 'https://api.nekolabs.web.id/tools/bypass/cf-turnstile?url=https://www.createimg.com/&siteKey=0x4AAAAAABggkaHPwa2n_WBx';
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error('Bypass gagal');
  return data.result;
}