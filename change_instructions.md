# Change Instructions

Use this when updating features or deploying changes.

## App changes

1) Pull latest code
2) Run `npm install`
3) Apply new schema changes if `src/lib/schema.sql` was modified
4) Deploy the app

## Schema updates

- Any changes in `src/lib/schema.sql` must be applied with InsForge `run-raw-sql`.
- If RLS policies change, re-run the policy section of the schema.

## Edge function updates

- Update `insforge/functions/scout-grants.js` as needed
- Re-deploy with InsForge `update-function`
- Confirm schedule still exists (cron)

## Data seeding

- Grants: `POST /api/ai/scout` (or UI button)
- Collaborators: `POST /api/collaborators/seed` (or UI button)

## Env changes

- If you update `.env`, make sure the same values are set in Antigravity and InsForge function envs.
