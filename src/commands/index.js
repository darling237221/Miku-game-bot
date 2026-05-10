// ─── REGISTRY DES COMMANDES ────────────────────────────────
// Chaque commande est une fonction async (ctx) → texte WhatsApp ou null.
// ctx = { sock, jid, phone, args, user, isAdmin }

import { menu } from './menu.js';
import { balance } from './balance.js';
import { daily } from './daily.js';
import { shop } from './shop.js';
import { buy } from './buy.js';
import { quiz } from './quiz.js';
import { give, setbal } from './admin.js';

// Map<string, { handler, aliases?, adminOnly? }>
export const COMMANDS = new Map([
  ['/menu',    { handler: menu }],
  ['/start',   { handler: menu }],
  ['/help',    { handler: menu }],

  ['/balance', { handler: balance }],
  ['/solde',   { handler: balance }],
  ['/bal',     { handler: balance }],

  ['/daily',   { handler: daily }],
  ['/d',       { handler: daily }],

  ['/shop',    { handler: shop }],
  ['/store',   { handler: shop }],

  ['/buy',     { handler: buy }],
  ['/achat',   { handler: buy }],

  ['/quiz',    { handler: quiz }],
  ['/q',       { handler: quiz }],

  ['/give',    { handler: give,   adminOnly: true }],
  ['/setbal',  { handler: setbal, adminOnly: true }],
]);

export function resolveCommand(rawCmd) {
  return COMMANDS.get(rawCmd.toLowerCase()) ?? null;
}
