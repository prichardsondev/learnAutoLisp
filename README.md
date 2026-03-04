# Learn AutoLISP

Beginner-focused learning platform for AutoLISP with:
- Guided lessons
- Interactive code runner
- Hint-first AI tutor
- Badges and weekly challenges
- Showcase feed with likes

## Stack
- Frontend: React + Vite + TypeScript
- API: Node.js + Express + TypeScript
- Data: Postgres + Prisma

## Quick Start
1. Install dependencies:
   - `npm install --prefix apps/api`
   - `npm install --prefix apps/web`
2. Configure API env in `apps/api/.env`:
   - `DATABASE_URL=postgresql://...`
   - `PORT=4000`
3. Generate Prisma client:
   - `npm run db:generate`
4. Push schema:
   - `npm run db:push`
5. Seed baseline content:
   - `npm --prefix apps/api run seed`
6. Run API:
   - `npm run dev:api`
7. Run web:
   - `npm run dev:web`

## Notes
- The evaluator is a constrained AutoLISP subset designed for safe educational exercises.
- AI tutor endpoint currently includes deterministic hint ladder behavior and guardrails.
