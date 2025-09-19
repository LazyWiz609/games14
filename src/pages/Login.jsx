import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login() {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !rollNumber.trim()) {
      setError('Please fill both fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), roll_number: rollNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      login({ id: data.userId, name: data.name, rollNumber: data.roll_number, school: data.school_name || '' });
      const to = location.state?.from?.pathname || '/games';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 480, background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Login</h2>
        <p style={{ marginTop: 0, color: '#6b7280' }}>Already a user? Enter your roll number and name to continue.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Roll Number</span>
            <input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="Enter your roll no" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }} />
          </label>
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button disabled={loading} type="submit" style={{ padding: '12px 16px', background: '#16a34a', color: 'white', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#6b7280' }}>New here? </span>
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
