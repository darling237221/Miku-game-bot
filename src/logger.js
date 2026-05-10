// ─── LOGGER PRETTY ─────────────────────────────────────────
// Logs console colorisés via chalk. Pino reste silencieux pour Baileys interne.

import chalk from 'chalk';
import pino from 'pino';

const ts = () => chalk.gray(new Date().toLocaleTimeString('fr-FR', { hour12: false }));

const make = (tag, color) => (msg, ...rest) => {
  console.log(`${ts()} ${color(tag)} ${msg}`, ...rest);
};

export const log = {
  info:    make('ℹ INFO   ', chalk.cyan.bold),
  ok:      make('✓ OK     ', chalk.green.bold),
  warn:    make('⚠ WARN   ', chalk.yellow.bold),
  error:   make('✗ ERROR  ', chalk.red.bold),
  event:   make('⚡ EVENT  ', chalk.magenta.bold),
  msg:     make('💬 MSG   ', chalk.blue.bold),
  cmd:     make('▶ CMD    ', chalk.greenBright.bold),
  db:      make('🗄  DB    ', chalk.gray.bold),
  cron:    make('⏱ CRON   ', chalk.yellow),
  pair:    make('🔑 PAIR  ', chalk.magentaBright.bold),
};

// Logger pino silencieux passé à Baileys (pas de spam dans la console)
export const baileysLogger = pino({ level: 'silent' });
