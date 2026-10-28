import React from 'react';
import { ShieldCheck, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { triggerReseed } from '../api';

export default function Footer({ onReseedComplete }) {
  const handleReseed = async () => {
    if (window.confirm("Reset database and reload default Tamil Nadu civic sample reports and hotspots?")) {
      try {
        await triggerReseed();
        if (onReseedComplete) onReseedComplete();
        alert("CleanTamil Nadu AI sample data reset successfully.");
      } catch (err) {
        alert("Failed to reset sample data: " + err.message);
      }
    }
  };

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid var(--border-color)',
      padding: '2.5rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem'
      }}>
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div className="brand-logo-badge" style={{ width: '32px', height: '32px' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
              CleanTamil Nadu AI
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Intelligent garbage detection, priority scoring, citizen reporting, and hotspot management system for Tamil Nadu municipal corporations.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleReseed}
              className="btn-outline btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Reset initial civic data"
            >
              <RefreshCw size={13} />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-subtle)' }}>
            Covered Corporations
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>• Greater Chennai Corporation (GCC)</li>
            <li>• Coimbatore City Municipal Corporation (CCMC)</li>
            <li>• Madurai Municipal Corporation (MMC)</li>
            <li>• Tiruchirappalli City Corporation</li>
            <li>• Salem & Tirunelveli Municipalities</li>
          </ul>
        </div>

        {/* Col 3: Ethical & Prototype Transparency Notice */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-subtle)' }}>
            Civic System Transparency
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
            <strong>AI Detection Integration:</strong> Operating in clearly labeled Prototype / Demo Mode until trained production weights are mounted. No simulated output is presented as real predictions.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            <strong>Priority Rules:</strong> Initial weighted heuristic formula is an academic civic prototype designed for public inspection and municipal evaluation.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1320px',
        margin: '2rem auto 0 auto',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-subtle)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <span>© 2026 CleanTamil Nadu AI Platform — Swachh Tamil Nadu Mission.</span>
        <span>Dedicated to clean streets, sustainable cities, and civic transparency.</span>
      </div>
    </footer>
  );
}
