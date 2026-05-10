import { adjustBalance, setBalance } from '../services/economy.js';
import { ensureUser } from '../services/users.js';
import * as M from '../ui/messages.js';

export async function give({ args }) {
  const target = String(args[0] ?? '').replace(/\D/g, '');
  const amount = Number.parseInt(args[1], 10);
  if (!target || !Number.isFinite(amount)) {
    return M.adminInvalidArgs('Usage : */give <numéro> <montant>*');
  }
  ensureUser(target);
  const updated = adjustBalance(target, amount);
  return M.adminGive(target, amount, updated.balance);
}

export async function setbal({ phone, args }) {
  const amount = Number.parseInt(args[0], 10);
  if (!Number.isFinite(amount)) {
    return M.adminInvalidArgs('Usage : */setbal <montant>*');
  }
  const updated = setBalance(phone, amount);
  return M.adminSetBal(updated.balance);
}
