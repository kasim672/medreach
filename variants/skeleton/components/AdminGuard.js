"use client";
import { useAdminAccess } from "@medreach/core";
import AdminNav from "./AdminNav";

// Wraps every admin page: gates on admin role and renders the sub-nav.
export default function AdminGuard({ title, subtitle, children, className = "" }) {
  const { ready, allowed } = useAdminAccess();
  if (!ready) {
    return <section className="surface"><h1>{title}</h1><p role="status">Loading your workspace…</p></section>;
  }
  if (!allowed) {
    return <section className="surface"><h1>{title}</h1><p>Admin access required. Please sign in as a System Admin.</p></section>;
  }
  return (
    <div className={`admin-workspace ${className}`.trim()}>
      <header className="admin-page-header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <AdminNav />
      <div>{children}</div>
    </div>
  );
}
