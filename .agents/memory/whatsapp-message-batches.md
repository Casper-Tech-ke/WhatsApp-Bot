---
name: WhatsApp message batches
description: Baileys may deliver multiple incoming messages in one notification event.
---

Process every message supplied by a Baileys `messages.upsert` notification, rather than only the first entry.

**Why:** Moderation and command handling are per-message. Ignoring later entries silently bypasses features such as chat locks.

**How to apply:** Keep the event handler’s per-message filtering, status handling, revoke handling, and command dispatch inside an iteration over the full batch.