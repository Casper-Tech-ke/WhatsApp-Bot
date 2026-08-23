---
name: Group inventory privacy
description: Privacy boundary for commands that enumerate all WhatsApp groups the bot has joined.
---

The bot's complete group inventory—including names, JIDs, and member counts—must only be delivered in a direct chat to an owner or sudo user.

**Why:** Running an owner-only command inside any group would otherwise disclose every other group the bot belongs to, along with their metadata, to that group’s participants.

**How to apply:** Keep owner/sudo authorization and additionally reject group, community, channel, status, or other shared-chat invocations. Do not replace this boundary with a reply in the originating shared chat.