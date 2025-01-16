# wwebjs-sqlite

A SQLite plugin for whatsapp-web.js!

Use SqliteStore to save your WhatsApp MultiDevice session on a SQLite Database.

## Quick Links

- [Guide / Getting Started](https://wwebjs.dev/guide/authentication.html)
- [GitHub](https://github.com/eugabrielsilva/wwebjs-sqlite)
- [npm](https://www.npmjs.com/package/wwebjs-sqlite)

## Installation

The module is now available on npm! `npm i wwebjs-sqlite`

## Example usage

```js
const { Client, RemoteAuth } = require("whatsapp-web.js");
const { SqliteStore } = require("wwebjs-sqlite");

const store = new SqliteStore({ filename: "my-database.sqlite" });

const client = new Client({
  authStrategy: new RemoteAuth({
    store: store,
    backupSyncIntervalMs: 300000,
    session: "your-session-name",
  }),
});

client.initialize();
```

## Delete Remote Session

How to force delete a specific remote session on the Database:

```js
await store.delete({ session: "your-session-name" });
```
