// ─── AUTH / PAIRING CODE ───────────────────────────────────
// Demande le pairing code 8 caractères à WhatsApp si l'auth n'est pas
// encore enregistré. Affiche le code dans un cartouche.

import readline from 'node:readline';

import { config } from './config.js';
import { log } from './logger.js';
import { printPairingCode } from './ui/banner.js';

function askPhoneNumber() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('📞 Numéro WhatsApp du bot (format international sans +, ex: 50936989362) : ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function requestPairingIfNeeded(sock) {
  if (sock.authState.creds.registered) return;

  const raw = config.botPhone ?? (await askPhoneNumber());
  const phoneNumber = raw.replace(/\D/g, '');
  if (!phoneNumber) {
    log.error('Numéro invalide. Définis BOT_PHONE ou saisis-le au prompt.');
    process.exit(1);
  }

  // Laisser le WebSocket s'établir avant la demande
  setTimeout(async () => {
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      log.pair(`Pairing code demandé pour +${phoneNumber}`);
      printPairingCode(code);
    } catch (err) {
      log.error('Échec de la demande de pairing code :', err?.message ?? err);
    }
  }, 3000);
}
