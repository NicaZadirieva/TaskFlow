<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# API request organization

Organize each API request under a domain-specific folder with `server` and `client` subfolders. Server requests are for Server Components only; client requests can be imported by Client Components and must not depend on server-only APIs. Place the shared mock request in the common domain-specific folder alongside `server` and `client`, and select it using the existing mock-mode convention.

# Component organization

Place components that are not route pages in the `components` folder. Organize them using the existing feature-sliced design structure (such as domain `entities`, `features`, and `widgets`), and keep route files focused on page composition.
