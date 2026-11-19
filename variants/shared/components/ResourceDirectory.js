"use client";
import { useEffect, useState } from "react";
import { productApi } from "../lib/productApi";
import Link from "next/link";
import DiagnosticAvailability from "./DiagnosticAvailability";

export default function ResourceDirectory({ AmbulanceBookingModal, kind, title, intro, label, onSelectResource }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [diagnosticUrgency, setDiagnosticUrgency] = useState("ROUTINE");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      productApi(`/api/${kind}?q=${encodeURIComponent(query)}&page=${page}&limit=12&view=summary`, { signal: controller.signal })
        .then(r => {
          if (!controller.signal.aborted) {
            setItems(r.data || []);
            setHasMore(r.pagination?.hasMore === true);
            setError("");
          }
        })
        .catch(e => { if (!controller.signal.aborted) { setItems([]); setError(e.message); } })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, query ? 200 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [kind, query, page, revision]);

  const handleBook = (item) => {
    setSelectedProvider(item);
    setShowBooking(true);
  };

  return (
    <div className="resource-directory">
      <div className="page-head parity-mb-4">
        <h1>{title}</h1>
        <p>{intro}</p>
        {kind === "diagnostics" && <div className="parity-flex parity-wrap parity-gap-2 parity-mt-3" role="group" aria-label="Diagnostic request priority">
          <button className={`parity-action ${diagnosticUrgency === "ROUTINE" ? "parity-action-primary" : "parity-action-outline-primary"}`} aria-pressed={diagnosticUrgency === "ROUTINE"} onClick={() => setDiagnosticUrgency("ROUTINE")}>Routine tests</button>
          <button className={`parity-action ${diagnosticUrgency === "URGENT" ? "parity-action-danger" : "parity-action-outline-danger"}`} aria-pressed={diagnosticUrgency === "URGENT"} onClick={() => setDiagnosticUrgency("URGENT")}>Emergency tests</button>
          <p className="parity-full-width parity-mb-0 parity-muted">{diagnosticUrgency === "URGENT" ? "Ask a centre to review urgent testing, including dates where routine bookings are full. The centre must confirm a time." : "Choose a centre, test and date. Routine bookings are limited to 30 patients per test per day once daily capacity is enabled."}</p>
        </div>}
      </div>
      <div className="surface directory-search parity-mb-4"><label className="parity-field-label parity-semibold" htmlFor="resource-search">Search {label}</label>
      <input
        id="resource-search"
        className="parity-field"
        value={query}
        onChange={e => { setQuery(e.target.value); setPage(1); }}
        placeholder="Search name, service or locality"
      />
      </div>
      {kind === "diagnostics" && !loading && !error && <DiagnosticAvailability centres={items} urgency={diagnosticUrgency} />}
      {loading && <p role="status">Loading providers…</p>}
      {error && (
        <div className="parity-message parity-message-error parity-flex parity-wrap parity-center-items parity-between parity-gap-2" role="alert">
          <span>{error}</span>
          <button type="button" className="parity-action parity-action-small parity-action-outline-danger" onClick={() => setRevision((value) => value + 1)}>Retry</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="surface">No listed providers match this search. Try another locality or service.</div>
      )}
      <div className="parity-grid parity-grid-gap">
        {!loading && !error && items.map(item => (
          <div className="parity-span-half-medium parity-span-third-wide" key={item._id}>
            <article className="surface parity-full-height parity-flex parity-column">
              <div className="parity-flex parity-between parity-gap-2">
                <h2 className="parity-heading-5">{item.name}</h2>

              </div>
              <p className="parity-small parity-muted parity-mb-2">
                {item.address || item.locality || "Address not supplied"}
              </p>
              <p className="parity-small parity-mb-2">
                {item.services?.length ? item.services.join(" · ") : item.providerType || "Services not specified"}
              </p>
              <p className="disclaimer parity-mb-2">
                Hours: {item.operatingHours || "Unknown"}{item.demo ? " · DEMO" : ""}
              </p>

              {kind === "blood-banks" && (
                <p className="disclaimer">Current blood inventory: unknown</p>
              )}
              {kind === "ambulances" && (
                <p className="disclaimer">Availability and dispatch: unknown. Contact provider directly.</p>
              )}
              <div className="parity-mt-auto parity-pt-3 parity-border-top parity-flex parity-wrap parity-gap-2">
                {kind === "ambulances" ? (
                  <>
                    <button
                      type="button"
                      className="parity-action parity-action-primary parity-action-small parity-semibold"
                      onClick={() => handleBook(item)}
                    >
                      Book Ambulance
                    </button>
                    {item.location?.coordinates?.length === 2 && (
                      <a
                        className="parity-action parity-action-outline parity-action-small"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.location.coordinates[1]},${item.location.coordinates[0]}`}
                      >
                        Navigate
                      </a>
                    )}
                    {item.phone ? (
                      <a className="parity-action parity-action-primary parity-action-small" href={`tel:${item.phone}`}>Call provider</a>
                    ) : (
                      <span className="parity-small parity-muted parity-center-self">Phone unavailable</span>
                    )}
                  </>
                ) : (
                  <>
                    {kind === "diagnostics" && <Link className="parity-action parity-action-primary parity-action-small" href={`/diagnostics/request?centre=${item._id}&urgency=${diagnosticUrgency}`}>{diagnosticUrgency === "URGENT" ? "Request emergency tests" : "Request tests"}</Link>}
                    {onSelectResource && kind === "blood-banks" && (
                      <button
                        type="button"
                        className="parity-action parity-action-danger parity-action-small parity-semibold"
                        onClick={() => onSelectResource(item)}
                      >
                        Request / Donate Blood
                      </button>
                    )}
                    {item.phone ? (
                      <a className={`parity-action parity-action-small ${kind === "diagnostics" ? "parity-action-outline" : "parity-action-primary"}`} href={`tel:${item.phone}`}>Call provider</a>
                    ) : (
                      <span className="parity-small parity-muted parity-center-self">Phone unavailable</span>
                    )}
                    {item.location?.coordinates?.length === 2 && (
                      <a
                        className="parity-action parity-action-outline parity-action-small"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.location.coordinates[1]},${item.location.coordinates[0]}`}
                      >
                        Navigate
                      </a>
                    )}
                  </>
                )}
              </div>
            </article>
          </div>
        ))}
      </div>
      {!loading && !error && (page > 1 || hasMore) && <nav className="parity-flex parity-center-items parity-gap-3 parity-mt-4" aria-label="Provider result pages">
        <button className="parity-action parity-action-outline-primary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous providers</button>
        <span>Page {page}</span>
        <button className="parity-action parity-action-outline-primary" disabled={!hasMore} onClick={() => setPage(value => value + 1)}>Next providers</button>
      </nav>}
      {showBooking && selectedProvider && (
        <AmbulanceBookingModal
          provider={selectedProvider}
          onClose={() => { setShowBooking(false); setSelectedProvider(null); }}
        />
      )}
    </div>
  );
}
