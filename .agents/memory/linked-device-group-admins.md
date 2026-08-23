---
name: Linked-device group admins
description: How WhatsApp linked-device IDs affect group admin detection.
---

Group metadata can identify an admin with an opaque `@lid` participant ID while providing their phone number or PN in separate fields. Permission checks must compare all available participant identities rather than comparing a phone JID with `participant.id` alone.

The same applies to mentions and quoted group members: resolve a matched LID participant through `phoneNumber` or PN before using it in participant-management actions. Privilege-list add/remove actions must also match the stored entry by resolved phone number rather than the opaque LID.

**Why:** A strict phone-JID comparison can report that the bot is not an admin even though WhatsApp lists it as an admin under its linked-device identity.

**How to apply:** Whenever code decides whether the bot or command sender is a group admin, compare the actual JID, `pn`, `phoneNumber`, and LID fields before denying the action. For a mentioned or quoted participant, prefer its phone JID derived from `phoneNumber` or PN over the raw LID.