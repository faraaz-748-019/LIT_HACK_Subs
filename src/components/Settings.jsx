import React, { useState } from 'react';
import { Key, Shield, ShieldAlert, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

export default function Settings({ 
  isPro, 
  setIsPro, 
  geminiKey, 
  setGeminiKey, 
  onResetData,
  onShowToast
}) {
  const [tempKey, setTempKey] = useState(geminiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setGeminiKey(tempKey);
    setIsSaved(true);
    onShowToast('Gemini API Key saved successfully!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearKey = () => {
    setGeminiKey('');
    setTempKey('');
    onShowToast('Gemini API Key cleared.', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all deals and reset? This cannot be undone.')) {
      onResetData();
      onShowToast('All application data has been reset.', 'success');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2 className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles className="nav-icon" style={{ color: 'var(--primary)' }} />
          AI & Parsing Settings
        </h2>
        <p className="settings-description" style={{ marginBottom: '1rem' }}>
          DealDesk has a smart, rule-based local parser that works immediately out-of-the-box.
          For advanced AI parsing that extracts complex messages, connect your Gemini Developer API Key.
        </p>

        <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="gemini-key-input">Gemini API Key</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                id="gemini-key-input"
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{ flexGrow: 1 }}
              />
              {geminiKey && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClearKey}
                >
                  Clear
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ minWidth: '100px' }}>
                {isSaved ? <CheckCircle2 size={16} /> : 'Save'}
              </button>
            </div>
            <span className="settings-description" style={{ fontSize: '0.8rem' }}>
              Don't have a key? You can get a free-tier API key from the{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
              >
                Google AI Studio
              </a>.
            </span>
          </div>
        </form>

        <div style={{ 
          background: geminiKey ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
          border: `1px solid ${geminiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          marginTop: '0.5rem'
        }}>
          {geminiKey ? (
            <>
              <CheckCircle2 size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>AI Mode: Active (Gemini API)</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Structured parsing powered by Gemini 2.5 Flash is active.</span>
              </div>
            </>
          ) : (
            <>
              <Shield size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>AI Mode: Hybrid Fallback (Regex Rules)</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Using optimized keyword rules to parse brand details. Insert key above to unlock Gemini AI.</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="settings-card">
        <h2 className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert className="nav-icon" style={{ color: 'var(--accent)' }} />
          Freemium & Demo Profile Tier
        </h2>
        <p className="settings-description" style={{ marginBottom: '1.25rem' }}>
          For testing and verification during evaluation, use this toggle to instantly switch between subscription tiers.
        </p>

        <div className="settings-row" style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          padding: '1.25rem', 
          borderRadius: '14px',
          border: '1px solid var(--border-color)' 
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1rem' }}>{isPro ? 'Pro Subscription active' : 'Free Tier active'}</strong>
              <span className="pro-badge" style={{ 
                background: isPro ? 'linear-gradient(135deg, var(--accent), var(--primary))' : 'rgba(255,255,255,0.1)',
                color: isPro ? 'white' : 'var(--text-muted)',
                boxShadow: isPro ? '0 0 10px rgba(168, 85, 247, 0.3)' : 'none'
              }}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
            <p className="settings-description">
              {isPro 
                ? 'Unlocked: Unlimited deals, Invoice Generator, and Earnings Analytics charts.' 
                : 'Locked: Limited to 2 active deals. Upgrade prompt will display if adding more.'
              }
            </p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isPro} 
              onChange={(e) => {
                setIsPro(e.target.checked);
                onShowToast(e.target.checked ? 'Upgraded to Pro tier!' : 'Downgraded to Free tier.', 'success');
              }} 
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="settings-section-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trash2 size={20} />
          Danger Zone
        </h2>
        <div className="settings-row">
          <div>
            <strong>Reset Database</strong>
            <p className="settings-description">Clear all deals, checklist subtasks, and reset local storage settings to start fresh.</p>
          </div>
          <button className="btn btn-danger" onClick={handleReset} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Trash2 size={16} />
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
