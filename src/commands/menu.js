import * as M from '../ui/messages.js';

export async function menu({ user, isAdmin }) {
  return M.menu(user.balance, isAdmin);
}
