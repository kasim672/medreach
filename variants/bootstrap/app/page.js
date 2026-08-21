'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * Home / hospital search page (Bootstrap 5 variant).
 * Accessibility: labelled search input, aria-live results region, semantic list.
 * Security: hospital fields are rendered as React text nodes (auto-escaped) —
 * the safe-by-default path, contrasted with legacy Bootstrap's data-template sink.
 */
export default function HomePage() {
  const [hospitals, setHospitals] = useState([]);
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function search(e) {
    if (e) e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const params = {};
      if (q) params.q = q;
      if (specialty) params.specialty = specialty;
      const data = await api.listHospitals(params);
      setHospitals(data.hospitals || []);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => { search(); /* eslint-disable-next-line */ }, []);

  return (
    <>
      <h1 className="h3 mb-4">Find a hospital</h1>

      <form className="row g-2 mb-4" onSubmit={search} role="search">
        <div className="col-12 col-md-6">
          <label htmlFor="q" className="form-label">Search by name or address</label>
          <input id="q" className="form-control" value={q}
                 onChange={(e) => setQ(e.target.value)} placeholder="e.g. General Hospital" />
        </div>
        <div className="col-8 col-md-4">
          <label htmlFor="specialty" className="form-label">Specialty</label>
          <input id="specialty" className="form-control" value={specialty}
                 onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology" />
        </div>
        <div className="col-4 col-md-2 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="submit">Search</button>
        </div>
      </form>

      <div aria-live="polite">
        {status === 'loading' && <p>Loading hospitals…</p>}
        {status === 'error' && <div className="alert alert-danger" role="alert">{error}</div>}
        {status === 'done' && hospitals.length === 0 && <p>No hospitals found.</p>}

        <ul className="list-unstyled row g-3">
          {hospitals.map((h) => (
            <li key={h._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h5 card-title">{h.name}</h2>
                  <p className="card-text text-muted mb-1">{h.address}</p>
                  <p className="card-text mb-2">
                    <span className={`badge ${h.emergencyStatus === 'critical' ? 'bg-danger' : 'bg-success'}`}>
                      {h.emergencyStatus}
                    </span>{' '}
                    <span className="text-muted small">Beds: {h.bedsAvailable}/{h.bedsTotal}</span>
                  </p>
                  <a className="btn btn-outline-primary btn-sm" href={`/hospitals/${h._id}`}>
                    View details
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
