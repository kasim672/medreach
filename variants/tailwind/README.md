# Tailwind CSS 4 variant — SCAFFOLD

Style-swap of the `../bootstrap` reference. To implement:

1. Copy `../bootstrap/lib/api.js` **unchanged** (identical backend contract).
2. Copy the four route files from `../bootstrap/app/` and replace Bootstrap
   classes with Tailwind utilities. Keep the same DOM structure, same
   `aria-*` attributes, same labels, same data flow.
3. Install: `next@14.2.15 react@18.3.1 react-dom@18.3.1 tailwindcss@4 @tailwindcss/postcss postcss`.
4. Add the Tailwind v4 build step (its Vite/PostCSS engine — NOT the old
   PostCSS-plugin model; see plan §9).
5. For modals/dropdowns, use the SAME headless JS layer chosen for Skeleton
   (parity rule 1 in ../README.md).

Verify with `npm run build` before evaluation, exactly as the Bootstrap variant was verified.
