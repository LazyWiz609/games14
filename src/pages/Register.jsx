import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiBase } from '../lib/apiBase.js';

export default function Register() {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !rollNumber.trim() || !school.trim()) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), roll_number: rollNumber.trim(), school_name: school.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      // Auto-login after register
      login({ id: data.userId, name: data.name, rollNumber: data.roll_number, school: data.school_name });
      navigate('/games', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 520, background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Register</h2>
        <p style={{ marginTop: 0, color: '#6b7280' }}>Create your account by providing your details.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Roll Number</span>
            <input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="Enter your roll no" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>School / Institution Name</span>
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Enter your school/institution" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }} />
          </label>
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button disabled={loading} type="submit" style={{ padding: '12px 16px', background: '#2563eb', color: 'white', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
            {loading ? 'Registering…' : 'Register'}
          </button>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#6b7280' }}>Already have an account? </span>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
