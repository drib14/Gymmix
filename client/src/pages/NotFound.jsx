import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Gymmix | Page Not Found';
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: '#0D0F14', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '8rem', fontWeight: 900, color: 'transparent',
        WebkitTextStroke: '2px #C8F135', lineHeight: 1, marginBottom: '16px' }}>
        404
      </div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: '#6B7280', maxWidth: '320px', marginBottom: '32px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        <FiArrowLeft /> Go Home
      </Link>
    </div>
  );
};

export default NotFound;
