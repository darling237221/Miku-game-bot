// ─── BANNIÈRE CONSOLE ──────────────────────────────────────

import boxen from 'boxen';
import chalk from 'chalk';

export function printBanner() {
  const lines = [
    chalk.magentaBright.bold('MIKU GAME BOT'),
    chalk.gray('────────────────────────'),
    chalk.cyan('Baileys v7') + chalk.gray(' · ') + chalk.cyan('ESM') + chalk.gray(' · ') + chalk.cyan('SQLite'),
    chalk.gray('Nexus Labs © 2026'),
  ].join('\n');

  console.log(
    boxen(lines, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'magenta',
      align: 'center',
    })
  );
}

export function printPairingCode(rawCode) {
  const code = rawCode.match(/.{1,4}/g)?.join('-') ?? rawCode;
  const body = [
    chalk.bold.white('Code de pairing WhatsApp'),
    '',
    chalk.bgMagenta.white.bold(`  ${code}  `),
    '',
    chalk.gray('WhatsApp → Paramètres → Appareils connectés'),
    chalk.gray('→ Lier un appareil → Lier avec un numéro'),
  ].join('\n');

  console.log(
    boxen(body, {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'magentaBright',
      align: 'center',
    })
  );
}
