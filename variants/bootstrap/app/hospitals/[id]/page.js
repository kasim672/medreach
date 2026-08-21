'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function HospitalDetail({ params }) {
  const [hospital, setHospital] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHospital(params.id).then((d) => setHospital(d.hospital)).catch((e) => setError(e.message));
  }, [params.id]);

  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;
  if (!hospital) return <p>Loading…</p>;

  return (
    <article>
      <a href="/" className="btn btn-link px-0 mb-3">← Back to search</a>
      <h1 className="h3">{hospital.name}</h1>
      <p className="text-muted">{hospital.address}</p>
      <p>
        <a className="btn btn-danger" href={`tel:${hospital.phone}`}>
          Emergency call: {hospital.phone}
        </a>
      </p>
      <dl className="row">
        <dt className="col-sm-3">Emergency status</dt>
        <dd className="col-sm-9">{hospital.emergencyStatus}</dd>
        <dt className="col-sm-3">Beds available</dt>
        <dd className="col-sm-9">{hospital.bedsAvailable} / {hospital.bedsTotal}</dd>
        <dt className="col-sm-3">Specialties</dt>
        <dd className="col-sm-9">{(hospital.specialties || []).join(', ') || '—'}</dd>
      </dl>
    </article>
  );
}
