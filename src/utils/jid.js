// ─── UTILITAIRES JID ───────────────────────────────────────
// En Baileys v7 un JID peut être @s.whatsapp.net, @lid, @g.us, etc.
// On extrait toujours la partie "user" sans suffixe serveur.

export function extractUserId(jid) {
  if (!jid) return null;
  const at = jid.indexOf('@');
  return at < 0 ? jid : jid.slice(0, at);
}

export function isGroupJid(jid) {
  return typeof jid === 'string' && jid.endsWith('@g.us');
}

export function isBroadcastJid(jid) {
  return typeof jid === 'string' && (jid.endsWith('@broadcast') || jid === 'status@broadcast');
}

export function isNewsletterJid(jid) {
  return typeof jid === 'string' && jid.endsWith('@newsletter');
}
