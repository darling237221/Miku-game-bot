// ─── SERVICE UTILISATEURS ──────────────────────────────────

import { config } from '../config.js';
import { stmt } from '../db.js';

export const isAdmin = (phone) => phone === config.adminPhone;

export function ensureUser(phone) {
  stmt.insert.run(phone);
  return stmt.get.get(phone);
}

export function getUser(phone) {
  return stmt.get.get(phone);
}

export function incrementMessageCount(phone) {
  stmt.incrMsg.run(phone);
  return stmt.get.get(phone);
}
