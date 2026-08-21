/**
 * Reactive-framework comparison arm (React) — addresses Almeida & S. (2026)
 * Limitation 2: the study "excludes ... frameworks based on reactive components,
 * whose security model may differ substantially."
 *
 * We test the SAME hospital-info payload used against Bootstrap, but rendered
 * through React's two content paths:
 *   - default JSX text interpolation ({value}) — auto-escaped
 *   - dangerouslySetInnerHTML — NOT escaped (opt-out)
 *
 * This shows the reactive model's security posture is materially different:
 * XSS is OFF by default and only reappears via an explicit, greppable opt-out —
 * versus Bootstrap 4.1.3, where the tooltip data-template sink was unsafe by
 * default. This is the empirical, reactive-framework data point the paper lacks.
 *
 * We render with react-dom/server (no browser needed) and inspect the HTML.
 *
 * Run: node --test react-component-arm/react-xss.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const MALICIOUS = '<img src=x onerror="window.__x=1">';

test('React default JSX interpolation auto-escapes the payload (safe by default)', () => {
  const el = React.createElement('div', { className: 'tooltip-inner' }, MALICIOUS);
  const html = ReactDOMServer.renderToStaticMarkup(el);
  console.log('  JSX-rendered:', html);
  // The dangerous markup must be HTML-entity-escaped, not live.
  assert.doesNotMatch(html, /<img/, 'raw <img> must not appear');
  assert.match(html, /&lt;img/, 'payload must be escaped to &lt;img');
  assert.doesNotMatch(html, /onerror="/, 'live onerror attribute (real quotes) must not appear');
});

test('React dangerouslySetInnerHTML is the explicit, greppable opt-out that reintroduces XSS', () => {
  const el = React.createElement('div', {
    className: 'tooltip-inner',
    dangerouslySetInnerHTML: { __html: MALICIOUS },
  });
  const html = ReactDOMServer.renderToStaticMarkup(el);
  console.log('  dangerouslySetInnerHTML-rendered:', html);
  // Here the raw markup IS emitted — but only because of an explicit API whose
  // very name signals the risk and is trivially found in code review / lint.
  assert.match(html, /<img src=x onerror=/, 'opt-out path emits raw markup as expected');
});
