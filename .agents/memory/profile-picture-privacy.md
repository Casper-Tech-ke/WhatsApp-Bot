---
name: Profile-picture privacy
description: Privacy boundary for WhatsApp profile-picture lookup commands.
---

Account profile pictures are visible according to the bot account's WhatsApp privacy relationship, not necessarily the requester’s. Do not use that access to repost account images or resolved LID phone identities into a group or channel.

**Why:** A bot can otherwise become a confused deputy, disclosing contact-only profile pictures or a linked-device participant’s underlying phone identity to a wider audience.

**How to apply:** Restrict account-target profile lookups to owner/sudo users and direct chats. In shared chats, only allow the current group/community or channel picture and omit resolved target JIDs from output.