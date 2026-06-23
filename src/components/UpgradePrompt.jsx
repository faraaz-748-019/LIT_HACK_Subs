import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Flame, BarChart2 } from 'lucide-react';

export default function UpgradePrompt({ onClose, onUpgrade }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '500px', border: '1px solid rgba(168, 85, 247, 0.3)' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <button className="modal-close-btn" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 0, paddingBottom: '2.5rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            color: 'var(--accent)',
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
          }}>
            <Sparkles size={32} />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', marginBottom: '0.5rem' }}>Upgrade to DealDesk Pro</h2>
          <p className="settings-description" style={{ fontSize: '0.95rem', margin: '0 auto 1.5rem', maxWidth: '380px' }}>
            You've hit the limit of the Free tier. Free members can track up to <strong>2 active deals</strong> at a time.
          </p>

          {/* Benefits Bullet Points */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Track Unlimited Deals</strong>
                <p className="settings-description" style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>No pipelines caps. Manage all your brands in one dashboard.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Flame size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Professional PDF Invoicing</strong>
                <p className="settings-description" style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>Generate client invoices from completed deals in one click.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <BarChart2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Income & Analytics Dashboard</strong>
                <p className="settings-description" style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>Visualize monthly earnings and track payments awaiting deposit.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              style={{ width: '100%', padding: '0.85rem', display: 'flex', gap: '0.5rem' }}
            >
              <Sparkles size={16} />
              Unlock Pro Now (Demo Mode)
            </button>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', padding: '0.85rem' }}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
