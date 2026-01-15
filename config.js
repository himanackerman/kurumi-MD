import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

global.pairingNumber = 628xxxx;
global.owner = [['628xxxx', 'Hilman', true]];
global.mods = [];

global.namebot = 'ᴋᴜʀᴜᴍɪ ᴍᴅ ʙy ʜɪʟᴍᴀɴ';
global.author = 'Hilman';

global.wait = '✨ _Wait..._';
global.eror = '🚩 Terjadi Kesalahan...';

global.pakasir = {
	slug: 'hilman',
	apikey: 'bpWDefVpINpZmFwIeZ9lNta5YT9jxYej',
	expired: 30, //1 = 1menit. 30 = 30menit
};

global.stickpack = 'ᴄʀᴇᴀᴛᴇᴅ';
global.stickauth = namebot;

global.multiplier = 38; // The higher, The harder levelup

/*============== EMOJI ==============*/
global.rpg = {
	emoticon(string) {
		string = string.toLowerCase();
		let emot = {
			level: '📊',
			limit: '🎫',
			health: '❤️',
			stamina: '🔋',
			exp: '✨',
			money: '💹',
			bank: '🏦',
			potion: '🥤',
			diamond: '💎',
			common: '📦',
			uncommon: '🛍️',
			mythic: '🎁',
			legendary: '🗃️',
			superior: '💼',
			pet: '🔖',
			trash: '🗑',
			armor: '🥼',
			sword: '⚔️',
			pickaxe: '⛏️',
			fishingrod: '🎣',
			wood: '🪵',
			rock: '🪨',
			string: '🕸️',
			horse: '🐴',
			cat: '🐱',
			dog: '🐶',
			fox: '🦊',
			petFood: '🍖',
			iron: '⛓️',
			gold: '🪙',
			emerald: '❇️',
			upgrader: '🧰',
		};
		let results = Object.keys(emot)
			.map((v) => [v, new RegExp(v, 'gi')])
			.filter((v) => v[1].test(string));
		if (!results.length) return '';
		else return emot[results[0][0]];
	},
};

let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
	unwatchFile(file);
	console.log(chalk.redBright("Update 'config.js'"));
	import(`${file}?update=${Date.now()}`);
});
