// ─── EXTRACTION DE TEXTE WAMessage ─────────────────────────
// Couvre les messages normaux, étendus, éphémères (disappearing)
// et view-once — sans quoi les commandes ne passent pas pour les
// utilisateurs avec "messages éphémères" activé.

export function extractText(message) {
  if (!message) return '';
  const inner =
    message.ephemeralMessage?.message ??
    message.viewOnceMessage?.message ??
    message.viewOnceMessageV2?.message ??
    message.viewOnceMessageV2Extension?.message ??
    message;

  return (
    inner.conversation ??
    inner.extendedTextMessage?.text ??
    inner.imageMessage?.caption ??
    inner.videoMessage?.caption ??
    inner.documentMessage?.caption ??
    inner.buttonsResponseMessage?.selectedDisplayText ??
    inner.listResponseMessage?.title ??
    ''
  ).trim();
}

// Normalisation pour comparer une réponse de quiz (accents/casse insensibles).
export function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
