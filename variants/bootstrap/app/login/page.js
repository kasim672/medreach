'use client';

import { useState } from 'react';
import { api } from '../../lib/api';

/**
 * Login page (Bootstrap 5 variant).
 * Accessibility: labelled inputs, aria-describedby error linkage, role=alert.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const { user } = await api.login(email, password);
      setMe(user);
    } catch (err) {
      setError(err.message);
    }
  }

  if (me) {
    return (
      <div className="alert alert-success" role="status">
        Logged in as <strong>{me.name}</strong> ({me.role}).
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <h1 className="h3 mb-4">Log in</h1>
        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" type="email" className="form-control" autoComplete="email"
                   value={email} onChange={(e) => setEmail(e.target.value)}
                   aria-describedby={error ? 'login-error' : undefined} aria-invalid={!!error} required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-control" autoComplete="current-password"
                   value={password} onChange={(e) => setPassword(e.target.value)}
                   aria-describedby={error ? 'login-error' : undefined} aria-invalid={!!error} required />
          </div>
          {error && <div id="login-error" className="alert alert-danger" role="alert">{error}</div>}
          <button className="btn btn-primary w-100" type="submit">Log in</button>
        </form>
      </div>
    </div>
  );
}
