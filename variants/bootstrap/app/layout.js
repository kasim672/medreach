import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: 'MedReach — Hospital & Emergency Services',
  description: 'Find hospitals, emergency status, and first-aid guides.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="visually-hidden-focusable">Skip to main content</a>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary" aria-label="Main navigation">
          <div className="container">
            <a className="navbar-brand fw-bold" href="/">MedReach</a>
            <div className="navbar-nav">
              <a className="nav-link" href="/">Search</a>
              <a className="nav-link" href="/login">Log in</a>
              <a className="nav-link" href="/admin">Admin</a>
            </div>
          </div>
        </nav>
        <main id="main" className="container py-4">{children}</main>
        <footer className="container py-4 text-muted small border-top mt-5">
          MedReach (Bootstrap 5 variant) — research testbed for Almeida &amp; Sousa (2026) empirical extension.
        </footer>
      </body>
    </html>
  );
}
