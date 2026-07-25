# SAME STUDIO

Interactive app portfolio for SAME STUDIO.

The homepage uses a DOM-based continuous 3D carousel and a React Three Fiber
shader for the translucent jelly membrane. The carousel supports wheel,
trackpad, pointer drag, touch swipe, buttons, and keyboard navigation.

## Local development

Node.js `>=22.13.0` is required.

```bash
npm install
npm run dev
```

The local site runs at `http://localhost:3000`.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
node --test tests/rendered-html.test.mjs
```

The existing SAME STUDIO app icons and production links are preserved under
`public/`. Legal and support pages remain available at `/privacy/`, `/terms/`,
and `/support/`.
