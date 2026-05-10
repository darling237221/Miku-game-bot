import * as M from '../ui/messages.js';

export async function balance({ user, isAdmin }) {
  return M.balance(user.balance, isAdmin);
}
