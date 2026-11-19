"use client";
import { useEffect, useState } from "react";
import { productApi } from "../lib/productApi";
import { DIAGNOSTIC_TESTS, diagnosticDate, diagnosticTestLabel } from "../lib/diagnostics";

export default function DiagnosticCapacityManager({ organizationId }) {
  const [date, setDate] = useState(diagnosticDate(new Date()));
  const [test, setTest] = useState("CBC");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setData(null); setMessage("");
    productApi(`/api/capacity/diagnostic/${organizationId}/daily?date=${date}`, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setData(value.data); })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [organizationId, date, revision]);
  async function save(event) {
    event.preventDefault(); if (busy || !data) return;
    setBusy(true);
    try {
      await productApi(`/api/capacity/diagnostic/${organizationId}/daily`, { method: "PUT", body: {
        test, date, capacity: 30, urgentCapacity: 0, expectedVersion: data.find(row => row.test === test)?.version ?? 0,
      } });
      setRevision(value => value + 1);
    } catch (error) { setMessage(`${error.message} Reload before retrying.`); }
    finally { setBusy(false); }
  }
  return <section className="surface"><h2 className="parity-heading-4">Daily diagnostic capacity</h2>
    <p>Enable up to 30 routine patients per test on a date you can support. Emergency overflow requires individual review and a recorded explanation before confirmation.</p>
    <form onSubmit={save} className="parity-grid parity-grid-gap"><div className="parity-span-half-medium"><label htmlFor="capacity-test" className="parity-field-label">Test</label><select id="capacity-test" className="parity-field" value={test} onChange={event => setTest(event.target.value)}>{DIAGNOSTIC_TESTS.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></div>
      <div className="parity-span-half-medium"><label htmlFor="capacity-date" className="parity-field-label">Date</label><input id="capacity-date" className="parity-field" type="date" min={diagnosticDate(new Date())} value={date} onChange={event => setDate(event.target.value)} required /></div>
      <div className="parity-span-full"><button className="parity-action parity-action-primary" disabled={busy || !data}>{busy ? "Saving…" : "Confirm 30 daily slots for this test"}</button><button type="button" className="parity-action parity-action-outline parity-ms-2" disabled={busy} onClick={() => setRevision(value => value + 1)}>Reload</button></div>
    </form>
    {message && <p role="alert" className="parity-mt-3">{message}</p>}
    {data && <ul className="parity-mt-3 parity-mb-0">{data.map(row => <li key={row.test}>{diagnosticTestLabel(row.test)}: {row.routineRemaining === null ? "not configured" : `${row.routineRemaining} routine slots remaining`} · Version {row.version}</li>)}</ul>}
  </section>;
}
