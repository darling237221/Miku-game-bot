// ─── CONFIGURATION CENTRALE ────────────────────────────────
// Toutes les constantes runtime du bot. Modifiable via variables d'environnement.

export const config = Object.freeze({
  // Numéro de l'admin (sans + ni espaces, code pays inclus)
  adminPhone: process.env.ADMIN_PHONE ?? '50936989362',

  // Numéro WhatsApp du bot pour le pairing (optionnel, sinon prompt interactif)
  botPhone: process.env.BOT_PHONE ?? null,

  // Chemins runtime
  authDir: process.env.AUTH_DIR ?? 'auth',
  dbPath: process.env.DB_PATH ?? 'miku.db',

  // Économie
  startingBalance: 50,
  dailyReward: 10,
  messageReward: 5,
  messageRewardThreshold: 5,
  surpriseQuizChance: 0.01,
  quizTimeoutMs: 60_000,
});
