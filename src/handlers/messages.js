// ─── HANDLER : MESSAGES.UPSERT ─────────────────────────────
// Pipeline complet : filtrage → extraction → dispatch.
// Couvre Baileys v7 (JID @lid/@s.whatsapp.net, messages éphémères, view-once).

import { resolveCommand } from '../commands/index.js';
import { log } from '../logger.js';
import { ensureUser, incrementMessageCount, isAdmin } from '../services/users.js';
import { adjustBalance, tryGrantMessageReward } from '../services/economy.js';
import {
  hasPending,
  cancelPending,
  tryAnswer,
  startQuiz,
  shouldTriggerSurprise,
} from '../services/quiz.js';
import * as M from '../ui/messages.js';
import { extractUserId, isGroupJid, isBroadcastJid, isNewsletterJid } from '../utils/jid.js';
import { extractText } from '../utils/message.js';

async function send(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

async function dispatchCommand(ctx, cmdEntry) {
  const reply = await cmdEntry.handler(ctx);
  if (reply) await send(ctx.sock, ctx.jid, reply);
}

export function attachMessageHandler(sock) {
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // 'notify' = nouveaux messages temps réel, 'append' = sync historique
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        await handleOne(sock, msg);
      } catch (err) {
        log.error('Handler error :', err?.message ?? err);
      }
    }
  });
}

async function handleOne(sock, msg) {
  if (!msg?.message) return;
  if (msg.key?.fromMe) return;

  const jid = msg.key?.remoteJid;
  if (!jid) return;
  if (isGroupJid(jid) || isBroadcastJid(jid) || isNewsletterJid(jid)) return;

  const phone = extractUserId(jid);
  const text = extractText(msg.message);
  if (!text) return;

  log.msg(`[${phone}] ${text}`);

  // Init / increment counter
  ensureUser(phone);
  const user = incrementMessageCount(phone);

  // Bonus passif (1×/jour si seuil atteint)
  const reward = tryGrantMessageReward(user);
  if (reward) {
    await send(sock, jid, M.messageReward(reward.user.balance, reward.reward));
  }

  const admin = isAdmin(phone);
  const ctx = { sock, jid, phone, user, isAdmin: admin, args: [] };

  // 1) Réponse à un quiz en cours (avant tout, et seulement si pas une commande)
  if (hasPending(phone) && !text.startsWith('/')) {
    const result = tryAnswer(phone, text);
    if (result?.correct) {
      const refreshed = adjustBalance(phone, result.reward);
      await send(sock, jid, M.quizCorrect(refreshed.balance, result.reward));
    } else {
      await send(sock, jid, M.quizWrong());
    }
    return;
  }

  // 2) Commande → cancel quiz en cours puis dispatch
  if (text.startsWith('/')) {
    if (hasPending(phone)) cancelPending(phone);

    const parts = text.split(/\s+/);
    const rawCmd = parts[0];
    const args = parts.slice(1);
    const entry = resolveCommand(rawCmd);

    if (!entry) {
      await send(sock, jid, M.unknown());
      return;
    }

    if (entry.adminOnly && !admin) {
      await send(sock, jid, M.adminOnly());
      return;
    }

    log.cmd(`[${phone}] ${rawCmd}`);
    await dispatchCommand({ ...ctx, args }, entry);
    return;
  }

  // 3) Surprise quiz (1% de chance sur message normal)
  if (shouldTriggerSurprise()) {
    const q = startQuiz(phone, async (timed) => {
      try {
        await send(sock, jid, M.quizTimeout(timed.answers[0]));
      } catch { /* socket fermé */ }
    });
    await send(sock, jid, M.quizStart(q.q, q.reward));
  }
}
