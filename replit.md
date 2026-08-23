# Running ALICIAH AI

Start the bot with the **Start application** workflow (`node index.js`).

## First WhatsApp login

The running console prompts for a login method:

1. Press Enter (or type `1`) to use a pairing code.
2. Enter the bot account phone number with its country code and without `+`.
3. In WhatsApp, open **Settings → Linked devices → Link a device** and enter the pairing code shown in the console.

To restore an existing login without using the console, add its `SESSION_ID` as a Replit Secret and restart the workflow. The bot will then offer session login as option `3`.

`BOT_NAME`, `BOT_PREFIX`, and `AUTO_RESTART` are optional non-secret environment variables.