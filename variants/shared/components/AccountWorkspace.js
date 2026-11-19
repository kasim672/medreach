"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@medreach/core";
import AdminOverviewIcon from "./AdminOverviewIcon";
import LogoutButton from "./LogoutButton";

const accountLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/profile", label: "Profile", icon: "user" },
];
const providerLink = { href: "/provider", label: "Provider", icon: "hospital" };
const adminLinks = [
  { href: "/admin", label: "Admin", icon: "settings" },
  { href: "/admin/system-admins", label: "System Admins", icon: "users" },
];

export default function AccountWorkspace({ children }) {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const links = [...accountLinks];
  if (["provider_admin", "hospital_admin"].includes(user?.role)) links.push(providerLink);
  if (isAdmin && user?.role === "system_admin") links.push(...adminLinks);

  return (
    <div className={user ? "parity-account-workspace" : undefined}>
      {user && <nav aria-label="Account" className="parity-account-nav surface">
        <ul>
          {links.map(({ href, label, icon }) => {
            const active = (pathname === href || pathname?.startsWith(`${href}/`))
              && !(href === "/admin" && pathname?.startsWith("/admin/system-admins"));
            return <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined}>
                <AdminOverviewIcon name={icon} size={20} /> {label}
              </Link>
            </li>;
          })}
          <li>
            <LogoutButton className="parity-account-logout">
              <AdminOverviewIcon name="logout" size={20} /> Log out
            </LogoutButton>
          </li>
        </ul>
      </nav>}
      <div className="parity-account-content">{children}</div>
    </div>
  );
}
