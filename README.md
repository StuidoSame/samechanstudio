# SAME STUDIO

Interactive app portfolio for SAME STUDIO.

The homepage uses a DOM-based continuous 3D carousel and a React Three Fiber
shader for the translucent jelly membrane. The carousel supports wheel,
trackpad, pointer drag, touch swipe, buttons, and keyboard navigation.

## Local development

Node.js `>=22.13.0` is required. Use the shared development version `24.14.1`
from `.nvmrc` / `.node-version` on Windows and macOS.

```bash
npm install
npm run dev
```

Use the actual Local URL printed by the server (normally `http://localhost:3000`).
The npm scripts use a Node launcher so the same commands work in PowerShell
and zsh without shell-specific environment variable assignments.

## Validation

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
node --test tests/rendered-html.test.mjs
```

The existing SAME STUDIO app icons and production links are preserved under
`public/`. Legal and support pages remain available at `/privacy/`, `/terms/`,
and `/support/`.

## Agent development guide

Start with [AGENTS.md](AGENTS.md). The scoped guides under [docs/agent](docs/agent/PROJECT_STRUCTURE.md)
describe the existing architecture, design baseline, workflow, security and
cross-platform checks. See [Graft setup](docs/agent/GRAFT.md) for repository-bound
code navigation and [bootstrap results](docs/agent/BOOTSTRAP_REPORT.md) for actual
verification evidence and remaining issues. All commits remain local unless
the user explicitly requests a push; deployment is a separate authorized task.
