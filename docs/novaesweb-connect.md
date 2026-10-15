# NovaesWeb Connect 1.1

The repository has a planned server-side connection to the central NovaesWeb Supabase Edge Function. The current storefront and owner admin still use localStorage, so this document describes the safe onboarding flow and is not proof of a live connection.

## Required onboarding

1. The owner authenticates with the central NovaesWeb Supabase Auth project.
2. The site submits `request_site_registration` with a random UUID `idempotency_key`, site name, optional domain (null when none), owner name and plan code.
3. The Master reviews and approves the request in the central panel.
4. The owner checks registration status. Official `store_id` and `nx_id` are used only after approval.
5. Once active membership is confirmed, the site can call `site_checkin`.

Never invent a store ID or NX ID and do not create a fake production registration. Product, settings, and order persistence must be migrated separately to the existing tenant-scoped `delivery_*` tables, with the approved `store_id` on every operation. Until that migration and an owner login flow are completed and tested, this is not a completed live-store integration.