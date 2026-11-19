import AccountWorkspace from "../../../shared/components/AccountWorkspace";

export const metadata = { robots: { index: false, follow: false } };
export default function PrivateLayout({ children }) { return <AccountWorkspace>{children}</AccountWorkspace>; }
