# Progress Notes (2026-03-04)

## Completed
- Created full project scaffold under `N:\learnAutoLisp`.
- Implemented backend API (`apps/api`) with:
  - Magic-link auth endpoints
  - Lessons + checkpoints
  - AutoLISP subset code runner
  - Hint-first AI tutor endpoint
  - Badges and weekly challenge endpoints
  - Showcase publish/feed/like endpoints
- Implemented Prisma schema + seed script.
- Implemented frontend app (`apps/web`) with tabs for Learn, Challenge, Badges, Showcase, and AI Tutor.
- Added setup documentation and env template.

## Validation Done
- Installed dependencies for both apps.
- Prisma client generation passed.
- Frontend typecheck passed.
- Backend typecheck passed.
- Frontend production build passed.
- Backend production build passed.

## Known Environment Constraint
- Root npm workspaces could not be used due to symlink restrictions on this machine.
- Adjusted scripts to run apps independently via `npm --prefix ...`.

## Remaining (when Postgres is available)
1. Configure `apps/api/.env`:
   - `DATABASE_URL=...`
   - `PORT=4000`
2. Run database setup:
   - `npm run db:push`
   - `npm --prefix apps/api run seed`
3. Start services:
   - Terminal 1: `npm run dev:api`
   - Terminal 2: `npm run dev:web`
4. Open frontend:
   - `http://localhost:5173`

## Quick Smoke Test Checklist
- Request magic link token and sign in.
- Open Learn tab and run starter lesson code.
- Confirm badge unlock after first run/checkpoint.
- Submit weekly challenge and check result.
- Publish a showcase post and like it.
- Ask AI Tutor for a hint and verify hint ladder behavior.
