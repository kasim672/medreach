"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { post, productApi } from "../lib/productApi";
import { DIAGNOSTIC_TESTS, diagnosticDate, diagnosticTestLabel } from "../lib/diagnostics";
import CapacityNotice from "./CapacityNotice";

export default function DiagnosticRequestForm() {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [urgency, setUrgency] = useState("ROUTINE");
  const [preferredDate, setPreferredDate] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [dailyCapacity, setDailyCapacity] = useState(null);
  const [capacityError, setCapacityError] = useState(false);
  const submitting = useRef(false);
  const success = useRef(null);
  const errorMessage = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams(window.location.search);
    const id = query.get("centre");
    setUrgency(query.get("urgency") === "URGENT" ? "URGENT" : "ROUTINE");
    const requestedDate = query.get("date");
    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      const parsed = new Date(`${requestedDate}T00:00:00Z`);
      if (Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === requestedDate
        && requestedDate >= diagnosticDate(new Date()) && requestedDate <= diagnosticDate(new Date(Date.now() + 180 * 86400000))) setPreferredDate(requestedDate);
    }
    if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
      setError("Choose a diagnostic centre from the directory to start your request.");
      setLoading(false);
      return;
    }
    productApi(`/api/diagnostics/${id}`, { signal: controller.signal }).then(response => {
      setProvider(response.data);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => { if (result) success.current?.focus(); }, [result]);
  useEffect(() => { if (error) errorMessage.current?.focus(); }, [error]);
  useEffect(() => {
    setDailyCapacity(null); setCapacityError(false);
    if (!provider?._id || !preferredDate) return;
    const controller = new AbortController();
    productApi(`/api/capacity/diagnostic/${provider._id}/daily?date=${encodeURIComponent(preferredDate)}`, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setDailyCapacity(value.data); })
      .catch(() => { if (!controller.signal.aborted) setCapacityError(true); });
    return () => controller.abort();
  }, [provider?._id, preferredDate, result]);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new globalThis.FormData(event.currentTarget);
    const tests = data.getAll("tests");
    if (!tests.length) { setError("Select at least one test."); return; }
    submitting.current = true;
    setBusy(true); setError("");
    try {
      const response = await post("/api/diagnostics/requests", {
        providerId: provider._id, tests, urgency,
        patientName: data.get("patientName").trim(), contactPhone: data.get("contactPhone").trim(),
        contactEmail: data.get("contactEmail").trim(), preferredDate: data.get("preferredDate"),
        preferredTime: data.get("preferredTime"), notes: data.get("notes").trim(), consent: data.get("consent") === "on",
      });
      if (response.trackingToken) {
        try { window.sessionStorage.setItem(`medreach:diagnostic-request-token:${response.reference}`, response.trackingToken); } catch { /* The private link remains available. */ }
      }
      setResult(response);
    } catch (error) { setError(Array.isArray(error.details) ? error.details.map(detail => detail.msg).join(". ") : error.message); }
    finally { submitting.current = false; setBusy(false); }
  }
  const minDate = diagnosticDate(new Date());
  const maxDate = diagnosticDate(new Date(Date.now() + 180 * 86400000));
  const selectedFull = urgency === "ROUTINE" && dailyCapacity?.some(row => selectedTests.includes(row.test) && row.routineRemaining === 0);
  return <div className="diagnostic-request-page parity-mx-auto">
    <Link href="/diagnostics" className="parity-inline-block parity-mb-4">← Diagnostic centres</Link>
    <header className="page-head parity-mb-4"><h1>Request diagnostic tests</h1><p>Choose your tests and preferred visit. Every appointment requires confirmation.</p></header>
    {loading && <p role="status">Loading your selected centre…</p>}
    {error && <div className="parity-message parity-message-error" role="alert" tabIndex={-1} ref={errorMessage}>{error}</div>}
    {result ? <section className="surface parity-p-4 parity-p-md-5" aria-labelledby="diagnostic-success">
      <h2 id="diagnostic-success" className="parity-heading-3" ref={success} tabIndex={-1}>Your test request is recorded</h2>
      <p className="parity-mt-3"><strong>{result.reference}</strong></p><p>{provider.name}</p>
      <ul>{result.request.tests.map(test => <li key={test}>{diagnosticTestLabel(test)}</li>)}</ul>
      <p>Test availability and your appointment must be confirmed by the diagnostic centre.</p>
      <CapacityNotice record={result.request} resource="test appointment" />
      {dailyCapacity && <ul aria-label="Remaining slots after your request">{dailyCapacity.filter(row => result.request.tests.includes(row.test)).map(row => <li key={row.test}>{diagnosticTestLabel(row.test)}: {row.routineRemaining === null ? "Availability unknown" : `${row.routineRemaining} routine slots remaining`}</li>)}</ul>}
      {result.request.centreApprovalPending ? <p className="parity-message parity-message-info" role="status">Your request is saved for MedReach review. This centre has not enabled online appointments yet. MedReach must approve the centre before your request can be handed to it; no appointment is booked.</p>
        : result.request.notificationRouting === "no_eligible_recipients" && <p role="status">This centre has no eligible notification contact yet. Your request is saved for administrator follow-up. Contact the centre directly if you need an update.</p>}
      <Link className="parity-action parity-action-primary" href={`/track?type=diagnostic&reference=${encodeURIComponent(result.reference)}${result.trackingToken ? `#token=${encodeURIComponent(result.trackingToken)}` : ""}`}>Track test request</Link>
      <p className="parity-muted parity-mt-3 parity-mb-0">{result.trackingToken ? "Keep your private tracking link safe. It gives access to your request details." : "Sign in to this account to see your request details."}</p>
    </section> : provider && <form className="surface parity-p-4 parity-p-md-5" onSubmit={submit} onChange={() => { if (error) setError(""); }}>
      <fieldset disabled={busy}>
        <fieldset className="parity-mb-4"><legend className="parity-heading-5">Routine or emergency testing</legend><div className="parity-flex parity-wrap parity-gap-2">
          {[["ROUTINE", "Routine"], ["URGENT", "Emergency"]].map(([value, label]) => <button key={value} type="button" className={`parity-action ${urgency === value ? (value === "URGENT" ? "parity-action-danger" : "parity-action-primary") : "parity-action-outline"}`} aria-pressed={urgency === value} onClick={() => setUrgency(value)}>{label}</button>)}
        </div><p className="parity-muted parity-mt-2 parity-mb-0">{urgency === "URGENT" ? "Request priority review, even if routine capacity is full. A centre must confirm whether it can accept an emergency appointment." : "Choose your tests and a convenient date, including today. A full routine day cannot accept another routine booking."}</p></fieldset>
        <div className="parity-mb-4"><label htmlFor="diagnostic-centre" className="parity-field-label parity-semibold">Diagnostic centre</label>
          <input id="diagnostic-centre" className="parity-field" value={provider.name} readOnly /></div>
        {provider.approvalStatus !== "approved" && <p className="parity-message parity-message-info">You can send a request for MedReach to review. This centre has not enabled online appointments yet. Centre approval and appointment confirmation are required before a visit is booked.</p>}
        <fieldset className="parity-mb-4"><legend className="parity-heading-5">Select tests</legend>
          <p className="parity-muted" id="diagnostic-test-help">Select one or more. The centre will confirm which tests it offers.</p>
          <div className="parity-grid parity-grid-gap" aria-describedby="diagnostic-test-help">{DIAGNOSTIC_TESTS.map(([key, label]) => <div className="parity-span-half-small" key={key}>
            <label className="diagnostic-test-option"><input type="checkbox" name="tests" value={key} className="parity-check-input parity-m-0" onChange={event => { const checked = event.target.checked; setSelectedTests(old => checked ? [...old, key] : old.filter(test => test !== key)); }} /><span>{label}</span></label>
          </div>)}</div>
        </fieldset>
        <div className="parity-grid parity-grid-gap parity-mb-4">
          <div className="parity-span-half-medium"><label htmlFor="diagnostic-patient" className="parity-field-label parity-semibold">Patient name</label><input id="diagnostic-patient" name="patientName" className="parity-field" autoComplete="name" minLength={2} maxLength={150} placeholder="Enter patient name" required /></div>
          <div className="parity-span-half-medium"><label htmlFor="diagnostic-phone" className="parity-field-label parity-semibold">Contact number</label><input id="diagnostic-phone" name="contactPhone" type="tel" className="parity-field" autoComplete="tel" minLength={7} maxLength={25} placeholder="Enter contact number" required /></div>
          <div className="parity-span-full"><label htmlFor="diagnostic-email" className="parity-field-label parity-semibold">Email address <span className="parity-normal-weight parity-muted">(optional)</span></label><input id="diagnostic-email" name="contactEmail" type="email" className="parity-field" autoComplete="email" maxLength={150} placeholder="For request updates" /></div>
          <div className="parity-span-half-medium"><label htmlFor="diagnostic-date" className="parity-field-label parity-semibold">Preferred date</label><input id="diagnostic-date" name="preferredDate" type="date" className="parity-field" min={minDate} max={maxDate} value={preferredDate} onChange={event => setPreferredDate(event.target.value)} required /></div>
          <div className="parity-span-half-medium"><label htmlFor="diagnostic-time" className="parity-field-label parity-semibold">Preferred time</label><select id="diagnostic-time" name="preferredTime" className="parity-field" defaultValue="" required><option value="" disabled>Select time</option><option value="MORNING">Morning</option><option value="AFTERNOON">Afternoon</option><option value="EVENING">Evening</option></select></div>
          <div className="parity-span-full"><label htmlFor="diagnostic-notes" className="parity-field-label parity-semibold">Additional notes <span className="parity-normal-weight parity-muted">(optional)</span></label><textarea id="diagnostic-notes" name="notes" className="parity-field" rows={3} maxLength={1000} placeholder="Anything the centre should know about your request" /></div>
        </div>
        {preferredDate && <section className="parity-mb-4" aria-label="Daily test capacity"><h2 className="parity-heading-5">Routine capacity for {preferredDate}</h2>
          {capacityError ? <p role="status">Daily capacity could not be checked. Submission will validate it again.</p> : !dailyCapacity ? <p role="status">Checking daily capacity…</p> : <ul>{dailyCapacity.map(row => <li key={row.test}>{diagnosticTestLabel(row.test)}: {row.routineRemaining === null ? "capacity awaiting setup" : row.routineRemaining === 0 ? "Fully booked — choose another date or request emergency review" : `${row.routineRemaining} routine slots remaining`}</li>)}</ul>}
          <p className="parity-muted">The daily limit is 30 patients per test. Appointment time and test availability still require centre confirmation.</p>
        </section>}
        <p className="diagnostic-request-notice">Your appointment is not confirmed until the diagnostic centre accepts your request. Where verified daily capacity is configured, submission temporarily holds all selected tests together. Otherwise this remains a coordination request. The centre will confirm preparation instructions and charges.</p>
        <div className="parity-check parity-mb-4"><input className="parity-check-input" type="checkbox" id="diagnostic-consent" name="consent" required /><label className="parity-check-label" htmlFor="diagnostic-consent">I agree to share these details with MedReach and, once approved, the selected centre to coordinate my test request.</label></div>
        {selectedFull && <p role="alert">A selected test is fully booked on this date. Choose another date or request emergency review.</p>}
        <button className="parity-action parity-action-primary parity-px-4" type="submit" disabled={selectedFull}>{busy ? "Sending request…" : "Send Test Request"}</button>
      </fieldset>
    </form>}
  </div>;
}
