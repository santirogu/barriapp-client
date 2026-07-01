# BarriApp Client

Monorepo for the **BarriApp** client applications — a delivery platform for small
neighborhood stores ("tiendas de barrio") in Colombia plus a peer-to-peer errand
network ("mandados"). Backend lives in the sibling repo `barriapp-backend`.

## Apps & packages

```
apps/
  mobile/            # Expo + Expo Router (React Native mobile + web) — client/seller/collaborator
  admin/             # Next.js App Router — super_admin panel
packages/
  api-client/        # Typed API client (generated from backend OpenAPI) + React Query layer
  shared/            # Shared formatters (COP/date/geo), enums, error-code text
  config/            # Shared tsconfig / eslint / prettier
```

## Requirements

- Node.js ≥ 20
- pnpm 9 (via `corepack enable pnpm`)
- The backend running locally (see `../barriapp-backend`: `docker compose up --build`
  → http://localhost:8000)

## Getting started

```bash
corepack enable pnpm      # once, if pnpm is not installed
pnpm install              # install all workspaces
pnpm api:generate         # generate typed API client from the running backend
pnpm mobile               # start the Expo app (mobile + web)
pnpm admin                # start the Next.js admin panel
```

### Quality gates (run by CI)

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## API conventions (backend contract)

- Base URL `/api/v1`; JSON; dates ISO-8601 UTC.
- Auth: `Authorization: Bearer <accessToken>` (JWT). Refresh on `401 invalid_token`.
- Errors: `{ "error": { "code", "message", "details?" } }` — switch on `error.code`.
- Money is **integer COP**. Geo is GeoJSON `[longitude, latitude]`.
- Per-module contracts: `../barriapp-backend/app/<module>/FRONTEND.md`.

## Workflow

Git Flow: branch `feature/*` from `develop` → PR into `develop`. `main` is production.
