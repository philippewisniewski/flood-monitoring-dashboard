<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FloodWatch — project context

Live flood monitoring control-room dashboard (portfolio piece) using the EA
real-time flood monitoring API. **Read `design/DESIGN.md` first** — it is the
decisions log + component contracts for everything in this repo. The user's
build checklist is `design/TASKS.md`. Key rules:

- Components consume view models from `src/lib/mappers.ts` only, never raw API
  types (`src/lib/types.ts`). Derivations (trend, range position, displayName)
  live in mappers.
- Severity colours come from `src/lib/constants.ts` (`SEVERITY_CONFIG`) — the
  only place they're defined; badge/trend colours must NOT reuse severity colours.
- Server Components fetch with `{ next: { revalidate: 300 } }`; heavy endpoints
  (latest readings, polygons) go through Route Handlers. No WebSockets.
- The user builds components themselves (portfolio piece) — agent scaffolds,
  reviews, and helps with `lib/geo.ts` and Recharts config when asked.
