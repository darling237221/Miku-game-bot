// ─── HANDLER : CONNEXION ───────────────────────────────────

import { Boom } from '@hapi/boom';
import { DisconnectReason } from '@whiskeysockets/baileys';

import { log } from '../logger.js';

export function attachConnectionHandler(sock, onReconnect) {
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'connecting') {
      log.event('Connexion à WhatsApp…');
    } else if (connection === 'open') {
      log.ok('🌸 Miku Game Bot connecté !');
    } else if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      log.warn(`Déconnecté (code ${code}) — reconnexion : ${!loggedOut}`);
      if (loggedOut) {
        log.error('Session terminée. Supprime le dossier auth/ et relance pour re-pairer.');
        process.exit(0);
      }
      onReconnect();
    }
  });
}
