# Miku Game Bot

WhatsApp bot avec économie virtuelle, boutique et quiz — construit avec **Baileys v7 (ESM)**, **better-sqlite3** et **node-cron**.

## Architecture

```
src/
├── config.js              # constantes (env vars)
├── logger.js              # console pretty (chalk) + pino silencieux pour Baileys
├── db.js                  # connexion SQLite + statements préparés
├── auth.js                # flow pairing code
├── bot.js                 # bootstrap + startBot
├── data/
│   ├── cocktails.js       # catalogue du shop
│   └── quizzes.js         # banque de questions
├── services/
│   ├── users.js           # ensureUser / isAdmin
│   ├── economy.js         # daily / message reward / balance
│   ├── shop.js            # logique d'achat
│   └── quiz.js            # quiz state machine en mémoire
├── ui/
│   ├── messages.js        # templates de messages WhatsApp
│   └── banner.js          # bannière + cartouche pairing console
├── commands/
│   ├── index.js           # registry des commandes
│   ├── menu.js / balance.js / daily.js / shop.js / buy.js / quiz.js
│   └── admin.js           # /give /setbal
├── handlers/
│   ├── connection.js      # connection.update
│   └── messages.js        # messages.upsert (filtrage + dispatch)
└── utils/
    ├── jid.js             # extractUserId, isGroupJid, …
    └── message.js         # extractText (gère ephemeralMessage, viewOnce…)
index.js                   # point d'entrée (import bot.js)
```

## Démarrage

```bash
npm install
# avec numéro pré-configuré :
BOT_PHONE=509XXXXXXXX npm start
# ou avec prompt interactif :
npm start
```

Un code de pairing 8 caractères s'affiche dans la console (format `XXXX-XXXX`).
À saisir dans WhatsApp → Paramètres → Appareils connectés → Lier un appareil → Lier avec un numéro de téléphone.

Une fois la session liée, les credentials sont persistés dans `auth/` et la reconnexion ne demande plus de pairing code.

## Variables d'environnement

| Variable        | Défaut                | Description                                    |
| --------------- | --------------------- | ---------------------------------------------- |
| `BOT_PHONE`     | _(prompt interactif)_ | Numéro WhatsApp du bot (format international)  |
| `ADMIN_PHONE`   | `50936989362`         | Numéro de l'admin (accès aux commandes admin)  |
| `AUTH_DIR`      | `auth`                | Dossier de stockage des credentials Baileys    |
| `DB_PATH`       | `miku.db`             | Chemin du fichier SQLite                       |

## Commandes WhatsApp

| Commande              | Alias            | Description                          |
| --------------------- | ---------------- | ------------------------------------ |
| `/menu`               | `/start /help`   | Affiche le menu principal            |
| `/balance`            | `/solde /bal`    | Affiche ton solde                    |
| `/daily`              | `/d`             | Récupère ton bonus quotidien (+10🪙) |
| `/shop`               | `/store`         | Liste les cocktails du Miku Bar      |
| `/buy <id>`           | `/achat`         | Achète un cocktail                   |
| `/quiz`               | `/q`             | Lance un quiz (+5 à +10🪙)           |
| `/give <num> <mnt>`   | _(admin)_        | Crédite un utilisateur               |
| `/setbal <mnt>`       | _(admin)_        | Force ton solde                      |
