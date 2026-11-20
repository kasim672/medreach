"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { profileDestination, safeReturnTo, useAuth, validateLogin } from "@medreach/core";
import Link from "next/link";

const control = "w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-white px-3 py-2 focus:outline-none";
const controlInvalid = "border-[var(--color-danger)]";

export default function LoginPage() {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [returnTo, setReturnTo] = useState("/");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    setReady(true);
    const params = new URLSearchParams(window.location.search);
    const candidate = params.get("returnTo");
    setReturnTo(safeReturnTo(candidate));
    if (params.get("registered") === "1") {
      const pendingEmail = window.sessionStorage.getItem("medreach:pending-registration-email") || "";
      window.sessionStorage.removeItem("medreach:pending-registration-email");
      setForm({ email: pendingEmail, password: "" });
      setNotice("Registration accepted. Check your email for verification instructions, then sign in to continue.");
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || submitting.current) return;
    setServerError("");
    setNotice("");
    const check = validateLogin(form);
    setErrors(check.errors);
    if (!check.valid) return;
    submitting.current = true;
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      setForm((current) => ({ ...current, password: "" }));
      router.push(profileDestination(user, returnTo));
    } catch (err) {
      setServerError(err.message);
      setForm((current) => ({ ...current, password: "" }));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-7/12 lg:w-5/12">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-[var(--shadow-sm)] p-5">
          <h1 className="text-2xl mb-1">Welcome back</h1>
          <p className="text-[.78rem] text-[var(--color-muted)] mb-3">Sign in to save hospitals for quick access.</p>
          {serverError && <div className="rounded bg-[var(--color-danger-bg)] text-[var(--color-danger)] px-3 py-2 mb-3">{serverError}</div>}
          {notice && <div className="rounded bg-green-50 border border-green-200 text-green-800 px-3 py-2 mb-3" role="status">{notice}</div>}
          <form aria-busy={busy || !ready} onSubmit={submit} noValidate className="flex flex-col gap-3">
            <div>
              <label htmlFor="email" className="block font-semibold mb-1">Email</label>
              <input id="email" disabled={!ready} type="email" autoComplete="email" className={`${control} ${errors.email ? controlInvalid : ""}`} value={form.email} onChange={set("email")} />
              {errors.email && <div className="text-[var(--color-danger)] text-sm mt-1">{errors.email}</div>}
            </div>
            <div>
              <label htmlFor="password" className="block font-semibold mb-1">Password</label>
              <input id="password" disabled={!ready} type="password" autoComplete="current-password" className={`${control} ${errors.password ? controlInvalid : ""}`} value={form.password} onChange={set("password")} />
              {errors.password && <div className="text-[var(--color-danger)] text-sm mt-1">{errors.password}</div>}
            </div>
            <button className="inline-flex items-center justify-center font-bold text-lg rounded-[var(--radius)] bg-[var(--color-emergency)] text-white px-4 py-2 hover:bg-[var(--color-emergency-dark)]" type="submit" disabled={busy || !ready}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="text-center text-sm mt-2 mb-0"><Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="text-[var(--color-emergency-dark)] underline">Need an account? Register here</Link></p>
          <p className="text-center text-sm mt-2 mb-0"><Link href="/forgot-password" className="text-[var(--color-emergency-dark)] underline">Forgot password?</Link></p>
        </div>
      </div>
    </div>
  );
}
