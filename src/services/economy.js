// ─── SERVICE ÉCONOMIE ──────────────────────────────────────

import { config } from '../config.js';
import { stmt } from '../db.js';
import { getUser } from './users.js';

const today = () => new Date().toDateString();

// Renvoie { granted: boolean, user, reward }
export function claimDaily(phone) {
  const user = getUser(phone);
  const now = today();
  if (user.last_daily === now) {
    return { granted: false, user, reward: config.dailyReward };
  }
  stmt.setDaily.run(now, phone);
  return { granted: true, user: getUser(phone), reward: config.dailyReward };
}

// Bonus passif quand l'utilisateur a envoyé N messages aujourd'hui
// (une seule fois par jour). Renvoie { granted, user, reward } ou null.
export function tryGrantMessageReward(user) {
  const now = today();
  if (user.messages_today < config.messageRewardThreshold) return null;
  if (user.msg_reward_date === now) return null;
  stmt.setMsgReward.run(now, user.phone);
  return { granted: true, user: getUser(user.phone), reward: config.messageReward };
}

export function adjustBalance(phone, delta) {
  stmt.addBalance.run(delta, phone);
  return getUser(phone);
}

export function setBalance(phone, value) {
  stmt.setBalance.run(value, phone);
  return getUser(phone);
}

export function resetDailyMessageCounters() {
  stmt.resetDaily.run();
}
