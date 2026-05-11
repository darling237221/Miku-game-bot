import { buy as buyService, SHOP_RESULT } from '../services/shop.js';
import * as M from '../ui/messages.js';

export async function buy({ phone, args }) {
  const id = Number.parseInt(args[0], 10);
  if (!Number.isFinite(id)) return M.buyInvalid();

  const { result, user, item } = buyService(phone, id);
  switch (result) {
    case SHOP_RESULT.INVALID_ITEM:        return M.buyInvalid();
    case SHOP_RESULT.INSUFFICIENT_FUNDS:  return M.buyInsufficient(item, user.balance);
    case SHOP_RESULT.OK:                  return M.buyOk(item, user.balance);
    default:                              return M.buyInvalid();
  }
}
