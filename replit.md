# BreakBridge

## Overview
BreakBridge is a live break scheduling and staffing decision platform for multi-tenant childcare operations. Full-stack NestJS + Prisma backend with a React/Vite operational dashboard.

## Architecture

### Stack
- **Backend**: NestJS + Prisma (PostgreSQL) — port 8080
- **Frontend**: React/Vite dashboard — port from $PORT env var (proxied at `/`)
- **Auth**: Supabase JWT (passthrough in dev when `SUPABASE_AUTH_ENFORCE != "true"`)
- **Package manager**: pnpm (monorepo workspace)

### Monorepo Layout
```
lib/prisma/           — @workspace/prisma: PrismaClient + generated types + schema
artifacts/api-server/ — @workspace/api-server: NestJS application (port 8080)
artifacts/dashboard/  — @workspace/dashboard: React/Vite operational dashboard
artifacts/mockup-sandbox/ — canvas component previews
```

### Database (Prisma Schema)
Multi-tenant hierarchy: Organization → Location → Classroom → Staff

Models:
- Organization, Location, Classroom (NOT "Room"), Staff
- AttendanceSnapshot + AttendanceEntry
- BreakPlan + BreakAssignment
- CoverageAssignment
- RuleConfig, ExclusionRule
- Role, UserRole, User, UserLocationAccess
- AuditEvent, ExportArtifact

### NestJS Modules (19 total)
| Module | Controller path |
|---|---|
| health | /api/healthz |
| auth | /api/auth |
| organizations | /api/organizations |
| locations | /api/locations |
| classrooms | /api/classrooms |
| staff | /api/staff |
| users | /api/users |
| roles | /api/roles |
| attendance | /api/attendance |
| attendance-imports | /api/attendance-imports |
| breaks | /api/break-plans |
| coverage | /api/coverage-assignments |
| rule-engine | /api/rule-engine |
| audit | /api/audit-events |
| integrations | /api/integrations |
| exports | /api/exports |
| jobs | /api/jobs |
| admin | /api/admin |

### System Roles (5 seeded)
`platform_admin`, `org_admin`, `location_admin`, `supervisor`, `viewer`

### Seed Data
- 1 org: BrightStart Early Learning
- 2 locations: Maple Grove Center (primary, with all data), Cedar Ridge Center
- 6 classrooms (Maple Grove): Infant, Toddler, Twos, Threes, Pre-K A, Pre-K B
- 12 fictional staff members (no real names); 2 BREAKERs: Skyler Fontaine, Hayden Merritt
- 5 system roles

## Frontend Dashboard Pages
- `/` — Staffing Board: live ratio cards, classroom grid (GREEN/FRAGILE/MAXED), staff duty list with BREAKER badge, KPI tiles
- `/planner` — Break Planner: auto-propose algorithm, assignment table (time, staff, classroom, covered-by, status), CSV export
- `/import` — Tadpoles Import: paste raw clipboard text, parse and create attendance snapshot with result preview
- `/settings` — Admin Settings: rule config (break cutoff, duration, min gap, max breaks per breaker)

### Frontend Technical Details
- React Query with 30-second polling on classrooms and staff
- LocationProvider context drives all queries
- Vite proxy forwards `/api` → `http://localhost:8080`
- Dark-mode operational UI with Tailwind CSS

## Canonical URL Paths
- `/api/break-plans`
- `/api/coverage-assignments`
- `/api/audit-events`
- `/api/rule-engine`

## Entity Naming Rules
- **Classroom** everywhere — never "Room"
- No real employee names in seed data

## Dev Setup
```bash
pnpm install
pnpm --filter @workspace/prisma run generate
pnpm --filter @workspace/prisma run push
# Run seed:
/home/runner/workspace/artifacts/api-server/node_modules/.bin/ts-node --transpile-only lib/prisma/prisma/seed.ts
```

## Environment Variables
- `DATABASE_URL` — auto-provisioned in Replit dev
- `SUPABASE_AUTH_ENFORCE` — set to "true" to enforce JWT auth; omit/false for dev passthrough
- `PORT` — injected by artifact runner

## API Documentation
Swagger UI: `http://localhost:8080/api/docs`
OpenAPI JSON: `http://localhost:8080/api/docs-json`

## Build Status — COMPLETE
- [x] Phase 1 — Foundation: lib/prisma, NestJS api-server, 19 modules, auth guards, seed data
- [x] Phase 2 — Domain Modules: RuleEngineService, break proposal algorithm, Tadpoles parser, exports, audit, coverage
- [x] Phase 3 — Frontend Dashboard: Staffing Board, Break Planner, Attendance Import, Admin Settings — all e2e tested and passing
