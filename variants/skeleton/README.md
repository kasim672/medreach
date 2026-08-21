# Skeleton CSS variant — SCAFFOLD

Style-swap of the `../bootstrap` reference. To implement:

1. Copy `../bootstrap/lib/api.js` **unchanged**.
2. Copy the four route files; replace Bootstrap classes with Skeleton's minimal
   grid/typography classes. Keep identical DOM structure and all `aria-*` attributes.
3. Install: `next@14.2.15 react@18.3.1 react-dom@18.3.1 skeleton-css@2.0.4`.
4. **Important (plan §6):** Skeleton ships NO JavaScript components. The search
   modal / dropdowns / admin toggles need an added JS layer. Use the SAME layer as
   the Tailwind variant so the interaction JS is held constant and does not become
   an uncontrolled variable.
5. Note for the maintenance axis: Skeleton has been effectively unmaintained since
   ~2014 (EOL) — this is expected to be the dominant signal for this variant, per
   plan §4.

Verify with `npm run build` before evaluation.
