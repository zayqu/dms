import React from 'react';
import apiClient from '../../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = React.useState('owner@dms.local');
  const [password, setPassword] = React.useState('Daraja123!');
  const [loading, setLoading] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // 1️⃣ LOGIN
      const res = await apiClient.api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      // 2️⃣ SAVE TOKEN
      localStorage.setItem('token', res.token);

      // 3️⃣ FETCH USER
      const me = await apiClient.api('/api/auth/me');

      // 4️⃣ SAVE USER
      localStorage.setItem('user', JSON.stringify(me.user));

      // 5️⃣ PASS BOTH TO APP
      onLogin(me.user, res.token);

    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }}>
      <div className="card p-3">
        <h4>Login</h4>
        <form onSubmit={submit}>
          <input
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
