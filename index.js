// ╔══════════════════════════════════════════╗
// ║     MIKU GAME BOT — Baileys v7 ESM       ║
// ║     Nexus Labs © 2026                    ║
// ╚══════════════════════════════════════════╝

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import Database from 'better-sqlite3';
import cron from 'node-cron';
import pino from 'pino';
import readline from 'node:readline';

// ─── CONFIG ───────────────────────────────
const ADMIN_PHONE = '50936989362';

// ─── DATABASE ─────────────────────────────
const db = new Database('miku.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    phone            TEXT PRIMARY KEY,
    balance          INTEGER DEFAULT 50,
    messages_today   INTEGER DEFAULT 0,
    msg_reward_date  TEXT    DEFAULT '',
    last_daily       TEXT    DEFAULT '',
    created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
  )
`);

// Statements préparés (sync = pas de callback hell)
const stmt = {
  get:             db.prepare('SELECT * FROM users WHERE phone = ?'),
  insert:          db.prepare('INSERT OR IGNORE INTO users (phone) VALUES (?)'),
  incrMsg:         db.prepare('UPDATE users SET messages_today = messages_today + 1 WHERE phone = ?'),
  addBalance:      db.prepare('UPDATE users SET balance = balance + ? WHERE phone = ?'),
  setBalance:      db.prepare('UPDATE users SET balance = ? WHERE phone = ?'),
  setDaily:        db.prepare('UPDATE users SET last_daily = ?, balance = balance + 10 WHERE phone = ?'),
  setMsgReward:    db.prepare('UPDATE users SET msg_reward_date = ?, balance = balance + 5 WHERE phone = ?'),
  resetDaily:      db.prepare('UPDATE users SET messages_today = 0'),
};

// ─── HELPERS ──────────────────────────────
const isAdmin = (phone) => phone === ADMIN_PHONE;

function ensureUser(phone) {
  stmt.insert.run(phone);
  return stmt.get.get(phone);
}

// ─── DONNÉES ──────────────────────────────
const COCKTAILS = {
  1: { name: '🍸 Sakura Kiss',       price: 18 },
  2: { name: '🌸 Geisha Secret',     price: 22 },
  3: { name: '🐉 Dragon Breath',     price: 25 },
  4: { name: '💋 Scarlet Seduction', price: 28 },
  5: { name: '🌙 Midnight Velvet',   price: 32 },
  6: { name: '🍍 Forbidden Fruit',   price: 30 },
  7: { name: '🥃 Hibiki Whisky',     price: 45 },
  8: { name: '🍶 Dassai Saké',       price: 50 },
};

const QUIZZES = [
  { q: '🇯🇵 Quelle est la capitale du Japon ?',         answers: ['tokyo'],              reward: 5  },
  { q: '🎤 De quelle couleur sont les cheveux de Miku ?', answers: ['turquoise', 'bleu'], reward: 10 },
  { q: '🍙 Les sushis viennent-ils du Japon ?',          answers: ['oui', 'yes'],         reward: 3  },
  { q: '🌸 En quelle saison fleurissent les cerisiers ?', answers: ['printemps'],         reward: 5  },
  { q: '🎮 Miku est un personnage de quel logiciel ?',    answers: ['vocaloid'],          reward: 8  },
];

// Quiz en attente par numéro
const pendingQuizzes = new Map();

// ─── ENVOI ────────────────────────────────
async function send(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

// ─── QUIZ ─────────────────────────────────
async function launchQuiz(sock, jid, phone) {
  // Annule l'ancien quiz si existant
  pendingQuizzes.delete(phone);

  const quiz = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
  pendingQuizzes.set(phone, { ...quiz, timeout: setTimeout(() => {
    if (pendingQuizzes.has(phone)) {
      pendingQuizzes.delete(phone);
      send(sock, jid, `⏰ *Temps écoulé !* La réponse était : *${quiz.answers[0]}* 😿`);
    }
  }, 60_000) });

  await send(sock, jid,
    `🎯 *QUIZ MIKU !* 🎀\n\n` +
    `❓ ${quiz.q}\n\n` +
    `_Tu as 60 secondes pour répondre et gagner *+${quiz.reward}🪙* !_`
  );
}

// ─── COMMANDES ────────────────────────────
async function handleCommand(sock, jid, phone, cmd, args) {
  let user = stmt.get.get(phone);

  switch (cmd) {

    case '/menu':
      await send(sock, jid, buildMenu(user.balance, isAdmin(phone)));
      break;

    case '/balance':
    case '/solde':
      await send(sock, jid,
        `🪙 *Solde : ${user.balance.toLocaleString()} Pièces Miku*` +
        (isAdmin(phone) ? '\n👑 *ADMIN MODE ACTIF* 💖' : '')
      );
      break;

    case '/daily': {
      const today = new Date().toDateString();
      if (user.last_daily === today) {
        await send(sock, jid, `⏰ *Daily déjà réclamé aujourd'hui !*\nReviens demain 🌸`);
      } else {
        stmt.setDaily.run(today, phone);
        user = stmt.get.get(phone);
        await send(sock, jid,
          `🎁 *DAILY BONUS !* +10🪙\n` +
          `💰 Solde : *${user.balance.toLocaleString()}🪙*\n` +
          `Reviens demain ! 🌸`
        );
      }
      break;
    }

    case '/shop':
      await send(sock, jid, buildShopMenu());
      break;

    case '/buy': {
      const itemId = parseInt(args[0]);
      const item = COCKTAILS[itemId];

      if (!item) {
        await send(sock, jid, `❌ *Item invalide !*\nTape */shop* pour voir la liste.`);
        break;
      }
      if (user.balance < item.price && !isAdmin(phone)) {
        await send(sock, jid,
          `❌ *Solde insuffisant !*\n` +
          `💸 Prix : ${item.price}🪙  |  Ton solde : ${user.balance}🪙`
        );
        break;
      }
      if (!isAdmin(phone)) stmt.addBalance.run(-item.price, phone);
      user = stmt.get.get(phone);
      await send(sock, jid,
        `🎉 *${item.name} obtenu !* 🍹\n` +
        `💰 Solde restant : *${user.balance.toLocaleString()}🪙*\n\n` +
        `_Santé ! 🥂_`
      );
      break;
    }

    case '/transfer': {
      if (args.length < 2) {
        await send(sock, jid, `❌ Usage : */transfer numéro montant*\nEx : /transfer 50912345678 100`);
        break;
      }
      const target = args[0].replace(/[@+\s]/g, '');
      const amount = parseInt(args[1]);

      if (!target || target === phone) {
        await send(sock, jid, `❌ *Destinataire invalide !*`);
        break;
      }
      if (!amount || amount <= 0) {
        await send(sock, jid, `❌ *Montant invalide !*`);
        break;
      }
      if (user.balance < amount && !isAdmin(phone)) {
        await send(sock, jid, `❌ *Solde insuffisant !* (${user.balance}🪙 disponibles)`);
        break;
      }

      ensureUser(target);
      if (!isAdmin(phone)) stmt.addBalance.run(-amount, phone);
      stmt.addBalance.run(amount, target);

      user = stmt.get.get(phone);
      const targetUser = stmt.get.get(target);

      await send(sock, jid,
        `✅ *Transfert réussi !*\n` +
        `💸 ${amount}🪙 envoyés à *${target}*\n` +
        `💰 Solde : *${user.balance.toLocaleString()}🪙*`
      );
      await send(sock, `${target}@s.whatsapp.net`,
        `💸 *Tu as reçu ${amount}🪙 de ${phone} !* 🎉\n` +
        `💰 Solde : *${targetUser.balance.toLocaleString()}🪙*`
      );
      break;
    }

    case '/admin': {
      if (!isAdmin(phone)) {
        await send(sock, jid, `❌ *Accès refusé.* 🚫`);
        break;
      }
      stmt.setBalance.run(99_999_999, phone);
      await send(sock, jid, `👑 *ADMIN RECHARGÉ !*\n💰 Solde : *99,999,999🪙* ∞\n💖`);
      break;
    }

    case '/quiz':
      await launchQuiz(sock, jid, phone);
      break;

    default:
      await send(sock, jid, `❓ *Commande inconnue.*\nTape */menu* pour voir les options.`);
  }
}

// ─── MENUS ────────────────────────────────
function buildMenu(balance, admin) {
  return (
    `•⏤⵿⛦⃕͜🍒𝑲𝑨𝑾𝑨𝑰𝑻𝑨🌸𝑲𝑼𝑪𝑯𝑰𝑩𝑰𝑹𝑼ᬼ⃟𓃠꯭֟፞֟͠͠🍒\n\n` +
    `╭⁀➷ *𝖬𝖨𝖪𝖴 𝖦𝖠𝖬𝖤* 𓆩ᥫ᭡𓆪\n` +
    `│ 🪙 *Solde : ${balance.toLocaleString()} Pièces*\n│\n` +
    `🎀 /menu         › Menu principal\n` +
    `🪙 /balance      › Ton solde\n` +
    `💌 /daily        › Bonus quotidien (+10🪙)\n` +
    `🍸 /shop         › Bar Miku\n` +
    `🛒 /buy [1-8]    › Acheter un cocktail\n` +
    `➡️ /transfer [n] [montant]\n` +
    `❓ /quiz         › Quiz bonus\n` +
    (admin ? `👑 /admin        › Recharge admin\n` : '') +
    `╰─ 🌸 *Miku t'aime !* 𓍢ִֶָ`
  );
}

function buildShopMenu() {
  let menu = `🍸 *𝖬𝖨𝖪𝖴 𝖡𝖠𝖱 𝖭𝖮𝖢𝖳𝖴𝖱𝖭𝖤* 𓆩ᥫ᭡𓆪\n\n`;
  for (const [id, item] of Object.entries(COCKTAILS)) {
    menu += `${id}️⃣ *${item.name}* — ${item.price}🪙\n`;
  }
  menu += `\n╰─ _Acheter : /buy 3_ 𓍢ִֶָ`;
  return menu;
}

// ─── PAIRING ──────────────────────────────
function askPhoneNumber() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('📞 Entre le numéro WhatsApp du bot (format international sans +, ex: 50936989362) : ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── BOT ──────────────────────────────────
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    markOnlineOnConnect: false,
  });

  if (!sock.authState.creds.registered) {
    const raw = process.env.BOT_PHONE || (await askPhoneNumber());
    const phoneNumber = raw.replace(/\D/g, '');
    if (!phoneNumber) {
      console.error('❌ Numéro invalide. Relance avec BOT_PHONE=509XXXXXXXX ou saisis-le au prompt.');
      process.exit(1);
    }
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        const pretty = code.match(/.{1,4}/g)?.join('-') ?? code;
        console.log('\n╔══════════════════════════════╗');
        console.log(`║  🔑  CODE DE PAIRING : ${pretty}  ║`);
        console.log('╚══════════════════════════════╝');
        console.log('📱 WhatsApp → Paramètres → Appareils connectés → Lier un appareil → Lier avec un numéro de téléphone\n');
      } catch (err) {
        console.error('❌ Échec de la demande de pairing code :', err?.message || err);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`🔌 Déconnecté (code ${code}), reconnexion : ${shouldReconnect}`);
      if (shouldReconnect) startBot();
      else console.log('🚪 Déconnecté définitivement. Supprime le dossier auth/ et relance.');
    } else if (connection === 'open') {
      console.log('🌸 Miku Game Bot connecté !');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    if (!jid || jid.endsWith('@g.us')) return; // DM seulement

    const phone = jid.replace('@s.whatsapp.net', '');
    const text = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''
    ).trim();

    if (!text) return;

    // Init utilisateur
    let user = ensureUser(phone);
    stmt.incrMsg.run(phone);
    user = stmt.get.get(phone); // re-fetch après incrémentation

    // Récompense 5 messages/jour (une seule fois par jour)
    const today = new Date().toDateString();
    if (user.messages_today >= 5 && user.msg_reward_date !== today) {
      stmt.setMsgReward.run(today, phone);
      user = stmt.get.get(phone);
      await send(sock, jid,
        `💌 *MESSAGE REWARD !* +5🪙\n` +
        `Tu as envoyé 5 messages aujourd'hui 🎉\n` +
        `💰 Solde : *${user.balance.toLocaleString()}🪙*`
      );
    }

    // Vérif réponse quiz en attente
    if (pendingQuizzes.has(phone) && !text.startsWith('/')) {
      const quiz = pendingQuizzes.get(phone);
      const rep = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const correct = quiz.answers.some(a =>
        rep.includes(a.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
      );
      if (correct) {
        clearTimeout(quiz.timeout);
        pendingQuizzes.delete(phone);
        stmt.addBalance.run(quiz.reward, phone);
        user = stmt.get.get(phone);
        await send(sock, jid,
          `✅ *BONNE RÉPONSE !* 🎉\n` +
          `+${quiz.reward}🪙 | Solde : *${user.balance.toLocaleString()}🪙*`
        );
      } else {
        await send(sock, jid, `❌ *Mauvaise réponse !* Essaie encore... ⏳`);
      }
      return;
    }

    // Si une commande arrive pendant un quiz, on l'annule proprement
    if (pendingQuizzes.has(phone) && text.startsWith('/')) {
      clearTimeout(pendingQuizzes.get(phone).timeout);
      pendingQuizzes.delete(phone);
    }

    // Commandes
    if (text.startsWith('/')) {
      const parts = text.split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      await handleCommand(sock, jid, phone, cmd, args);
      return;
    }

    // 1% de chance de quiz surprise sur message normal
    if (Math.random() < 0.01) {
      await launchQuiz(sock, jid, phone);
    }
  });
}

// ─── CRON ─────────────────────────────────
// Reset compteur messages chaque nuit à minuit
cron.schedule('0 0 * * *', () => {
  stmt.resetDaily.run();
  console.log('🌙 Daily reset messages effectué');
});

// ─── START ────────────────────────────────
startBot().catch(console.error);
