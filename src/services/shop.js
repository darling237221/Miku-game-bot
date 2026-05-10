// ─── SERVICE SHOP ──────────────────────────────────────────

import { COCKTAILS } from '../data/cocktails.js';
import { stmt } from '../db.js';
import { getUser } from './users.js';

export const SHOP_RESULT = Object.freeze({
  INVALID_ITEM: 'INVALID_ITEM',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  OK: 'OK',
});

export function getItem(id) {
  return COCKTAILS[id] ?? null;
}

export function listItems() {
  return Object.entries(COCKTAILS).map(([id, item]) => ({ id: Number(id), ...item }));
}

// Renvoie { result, user?, item? }
export function buy(phone, itemId) {
  const item = getItem(itemId);
  if (!item) return { result: SHOP_RESULT.INVALID_ITEM };

  const user = getUser(phone);
  if (user.balance < item.price) {
    return { result: SHOP_RESULT.INSUFFICIENT_FUNDS, user, item };
  }

  stmt.addBalance.run(-item.price, phone);
  return { result: SHOP_RESULT.OK, user: getUser(phone), item };
}
