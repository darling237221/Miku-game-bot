// ─── TEMPLATES DE MESSAGES WHATSAPP ────────────────────────
// Toutes les chaînes envoyées dans WhatsApp.
// Conventions :
//   *gras*   _italique_   ~barré~   ```mono```
// Séparateurs Unicode pour un rendu propre dans WhatsApp Web et mobile.

import { COCKTAILS } from '../data/cocktails.js';

const HR = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

const fmt = (n) => n.toLocaleString('fr-FR');

// ─── ACCUEIL / MENU ────────────────────────────────────────
export const welcome = (balance, isAdmin) => `
╭─❀─≼ *MIKU GAME BOT* ≽─❀─╮
│
│ 🎀  Bienvenue dans l'univers Miku !
│ 💰  Solde actuel : *${fmt(balance)} 🪙*
${isAdmin ? '│ 👑  *Mode ADMIN activé*\n' : ''}╰────────────────────────────╯

✨ Tape */menu* pour découvrir les commandes.
`.trim();

export const menu = (balance, isAdmin) => `
╭─❀─≼ *MENU MIKU* ≽─❀─╮
│
│ 💰  Solde : *${fmt(balance)} 🪙*${isAdmin ? '  👑' : ''}
│
├─ 💎  *ÉCONOMIE*
│   • */balance*    — Voir ton solde
│   • */daily*      — Bonus quotidien (+10🪙)
│
├─ 🛍️  *BOUTIQUE*
│   • */shop*       — Liste des cocktails
│   • */buy <id>*   — Acheter un item
│
├─ 🎯  *JEUX*
│   • */quiz*       — Lancer un quiz
│
${isAdmin ? '├─ 👑  *ADMIN*\n│   • */give <id> <montant>*\n│   • */setbal <montant>*\n│\n' : ''}╰────────────────────────╯
`.trim();

// ─── ÉCONOMIE ──────────────────────────────────────────────
export const balance = (balance, isAdmin) => `
╭─❀─≼ *Ton Solde* ≽─❀─╮
│
│ 🪙  *${fmt(balance)} Pièces Miku*
${isAdmin ? '│ 👑  Mode ADMIN actif\n' : ''}╰────────────────────────╯
`.trim();

export const dailyClaimed = (balance, reward) => `
🎁 *DAILY BONUS !*
${HR}
🪙  *+${reward} Pièces Miku* ajoutées
💰  Solde : *${fmt(balance)} 🪙*

_Reviens demain pour ton prochain bonus !_ 🌸
`.trim();

export const dailyAlreadyClaimed = () => `
⏰ *Daily déjà réclamé !*
${HR}
Tu as déjà reçu ton bonus aujourd'hui.
_Reviens demain 🌸_
`.trim();

export const messageReward = (balance, reward) => `
💌 *MESSAGE REWARD !*
${HR}
🪙  *+${reward} Pièces Miku* pour ton activité
💰  Solde : *${fmt(balance)} 🪙*

_Tu reçois ce bonus 1×/jour pour avoir été actif·ve._
`.trim();

// ─── SHOP ──────────────────────────────────────────────────
export const shop = () => {
  const items = Object.entries(COCKTAILS)
    .map(([id, it]) => `│ *${id}.* ${it.name}\n│      💰 _${it.price} 🪙_`)
    .join('\n│\n');

  return `
╭─❀─≼ *MIKU BAR NOCTURNE* ≽─❀─╮
│
│ 𓆩 _Le bar le plus chic de la ville_ 𓆪
│
${items}
│
╰──────────────────────────────╯

🛒 _Acheter :_ */buy <id>*  (ex: */buy 3*)
`.trim();
};

export const buyOk = (item, balance) => `
✨ *Achat réussi !* ✨
${HR}
🍹  ${item.name}
💸  *− ${item.price} 🪙*
💰  Solde : *${fmt(balance)} 🪙*

_Profite bien de ton verre !_ 🥂
`.trim();

export const buyInvalid = () => `
❌ *Item invalide*
${HR}
Tape */shop* pour voir la liste des cocktails disponibles.
`.trim();

export const buyInsufficient = (item, balance) => `
💸 *Solde insuffisant !*
${HR}
🍹  ${item.name}
💰  Solde : *${fmt(balance)} 🪙*
💵  Prix : *${item.price} 🪙*
🔻  Il te manque : *${fmt(item.price - balance)} 🪙*

_Tape */daily* pour gagner +10🪙 !_
`.trim();

// ─── QUIZ ──────────────────────────────────────────────────
export const quizStart = (q, reward) => `
🎯 *QUIZ MIKU !* 🎀
${HR}
❓  ${q}

⏱️  _Tu as 60 secondes pour répondre_
🎁  _Récompense :_ *+${reward} 🪙*
`.trim();

export const quizCorrect = (balance, reward) => `
✅ *BONNE RÉPONSE !* 🎉
${HR}
🪙  *+${reward} Pièces Miku*
💰  Solde : *${fmt(balance)} 🪙*
`.trim();

export const quizWrong = () => `
❌ *Mauvaise réponse !*
${HR}
_Essaie encore..._ ⏳
`.trim();

export const quizTimeout = (answer) => `
⏰ *Temps écoulé !*
${HR}
La bonne réponse était : *${answer}* 😿
`.trim();

// ─── ADMIN ─────────────────────────────────────────────────
export const adminOnly = () => `
🚫 *Accès refusé*
${HR}
Cette commande est réservée à l'admin. 👑
`.trim();

export const adminGive = (target, amount, newBalance) => `
👑 *ADMIN — Give*
${HR}
🎯  Cible : *${target}*
🪙  Crédité : *+${fmt(amount)} 🪙*
💰  Nouveau solde : *${fmt(newBalance)} 🪙*
`.trim();

export const adminSetBal = (newBalance) => `
👑 *ADMIN — Set Balance*
${HR}
💰  Nouveau solde : *${fmt(newBalance)} 🪙*
`.trim();

export const adminInvalidArgs = (usage) => `
⚠️  *Usage incorrect*
${HR}
${usage}
`.trim();

// ─── GÉNÉRIQUE ─────────────────────────────────────────────
export const unknown = () => `
🤔 *Commande inconnue*
${HR}
Tape */menu* pour voir la liste des commandes.
`.trim();
