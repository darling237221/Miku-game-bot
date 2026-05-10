import { claimDaily } from '../services/economy.js';
import * as M from '../ui/messages.js';

export async function daily({ phone }) {
  const { granted, user, reward } = claimDaily(phone);
  return granted ? M.dailyClaimed(user.balance, reward) : M.dailyAlreadyClaimed();
}
