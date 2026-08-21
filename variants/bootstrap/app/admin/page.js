'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

/**
 * Admin dashboard (Bootstrap 5 variant) — bed/emergency status management.
 * Access is enforced by the BACKEND (requireRole('hospital_admin')); the UI
 * only reflects it. This mirrors the paper's thesis that access control is a
 * server-side concern, not a frontend/CSS one.
 */
export default function AdminPage() {
  const [me, setMe] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.me().then((d) => setMe(d.user)).catch(() => setMe(null));
    api.listHospitals().then((d) => setHospitals(d.hospitals || [])).catch((e) => setError(e.message));
  }, []);

  async function setStatusFor(id, emergencyStatus) {
    try {
      await api.updateHospitalStatus(id, { emergencyStatus });
      const d = await api.listHospitals();
      setHospitals(d.hospitals || []);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!me) {
    return (
      <div className="alert alert-warning" role="alert">
        You must be logged in as a hospital admin. <a href="/login">Log in</a>.
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-4">Admin dashboard</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <table className="table">
        <caption>Hospitals you can manage</caption>
        <thead>
          <tr><th scope="col">Hospital</th><th scope="col">Status</th><th scope="col">Actions</th></tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr key={h._id}>
              <td>{h.name}</td>
              <td>{h.emergencyStatus}</td>
              <td>
                <div className="btn-group" role="group" aria-label={`Set status for ${h.name}`}>
                  <button className="btn btn-sm btn-outline-success" onClick={() => setStatusFor(h._id, 'normal')}>Normal</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setStatusFor(h._id, 'critical')}>Critical</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
