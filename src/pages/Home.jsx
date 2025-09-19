import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Welcome</h1>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            background: '#2563eb',
            color: 'white',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Start Game
        </Link>
      </div>
    </div>
  );
}
