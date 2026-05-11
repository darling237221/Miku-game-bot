// ─── BASE DE DONNÉES SQLite ────────────────────────────────
// Connexion synchrone (better-sqlite3) + mode WAL pour les écritures concurrentes.

import Database from 'better-sqlite3';

import { config } from './config.js';
import { log } from './logger.js';

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    phone            TEXT PRIMARY KEY,
    balance          INTEGER DEFAULT ${config.startingBalance},
    messages_today   INTEGER DEFAULT 0,
    msg_reward_date  TEXT    DEFAULT '',
    last_daily       TEXT    DEFAULT '',
    created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
  );
`);

log.db(`Base prête : ${config.dbPath}`);

export const stmt = {
  get:          db.prepare('SELECT * FROM users WHERE phone = ?'),
  insert:       db.prepare(`INSERT OR IGNORE INTO users (phone, balance) VALUES (?, ${config.startingBalance})`),
  incrMsg:      db.prepare('UPDATE users SET messages_today = messages_today + 1 WHERE phone = ?'),
  addBalance:   db.prepare('UPDATE users SET balance = balance + ? WHERE phone = ?'),
  setBalance:   db.prepare('UPDATE users SET balance = ? WHERE phone = ?'),
  setDaily:     db.prepare(`UPDATE users SET last_daily = ?, balance = balance + ${config.dailyReward} WHERE phone = ?`),
  setMsgReward: db.prepare(`UPDATE users SET msg_reward_date = ?, balance = balance + ${config.messageReward} WHERE phone = ?`),
  resetDaily:   db.prepare('UPDATE users SET messages_today = 0'),
};

export { db };
