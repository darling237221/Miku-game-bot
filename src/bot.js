// ─── ENTRY POINT DU BOT ────────────────────────────────────

import makeWASocket, {
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import cron from 'node-cron';

import { requestPairingIfNeeded } from './auth.js';
import { config } from './config.js';
import { attachConnectionHandler } from './handlers/connection.js';
import { attachMessageHandler } from './handlers/messages.js';
import { baileysLogger, log } from './logger.js';
import { resetDailyMessageCounters } from './services/economy.js';
import { printBanner } from './ui/banner.js';

let cronScheduled = false;

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  log.info(`WA Web version : ${version.join('.')} (latest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: baileysLogger,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    browser: ['Miku Bot', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  attachConnectionHandler(sock, () => {
    log.info('Tentative de reconnexion…');
    startBot().catch((err) => log.error('Reconnect failed :', err?.message ?? err));
  });

  attachMessageHandler(sock);

  await requestPairingIfNeeded(sock);

  // Reset quotidien : une seule planification (les redémarrages ne créent pas de doublons)
  if (!cronScheduled) {
    cron.schedule('0 0 * * *', () => {
      resetDailyMessageCounters();
      log.cron('Reset quotidien des compteurs messages_today effectué');
    });
    cronScheduled = true;
  }

  return sock;
}

export function bootstrap() {
  printBanner();
  startBot().catch((err) => {
    log.error('Bot crash :', err);
    process.exit(1);
  });
}
