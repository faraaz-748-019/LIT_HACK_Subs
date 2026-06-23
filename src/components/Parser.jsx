import React, { useState, useEffect } from 'react';
import { parseMessageLocal, parseMessageGemini } from '../utils/parser';
import { AlertCircle, ArrowRight, Sparkles, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

const DEMO_TEMPLATES = [
  {
    name: 'Instagram DM Collab',
    text: "Hey! We love your page! 💖 Reaching out from Glossier. We would love to send you our new skincare set and pay you $250 for 1 Reel + 2 Stories. Can you post by July 15, 2026? Payment terms are Net 30 after upload. Let us know if you're down! - Sarah, PR Team"
  },
  {
    name: 'YouTube Sponsor Email',
    text: "Hi content creator, I'm Alex from Helix Sleep. We are interested in sponsoring a dedicated segment on your next YouTube video. Our budget is $1,200. We would need the content live before 2026-08-01. Payment will be processed within 15 days of upload. Let us know if you'd like to proceed!\n\nBest, Helix Sleep Team"
  },
  {
    name: 'TikTok Pitch (Vague)',
    text: "Yo! We want to do a TikTok post with you. Can you post next week? Budget is £300. Hit us back if you want to work together."
  }
];

export default function Parser({ 
  geminiKey, 
  onSaveDeal, 
  onShowToast, 
  isFreeLocked,
  onShowUpgradePrompt 
}) {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  
  // State for the editable form
  const [formBrand, setFormBrand] = useState('');
  const [formDeliverables, setFormDeliverables] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPaymentDue, setFormPaymentDue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [missingFields, setMissingFields] = useState([]);

  // Load a demo template text
  const handleLoadTemplate = (templateText) => {
    setInputText(templateText);
    setParsedData(null);
    onShowToast('Template loaded. Click "Parse Deal" to process!', 'success');
  };

  const handleParse = async () => {
    if (!inputText.trim()) {
      onShowToast('Please paste a brand message first.', 'error');
      return;
    }

    setIsParsing(true);
    try {
      let result;
      if (geminiKey) {
        // Use Gemini API
        result = await parseMessageGemini(inputText, geminiKey);
      } else {
        // Local regex parsing
        result = parseMessageLocal(inputText);
      }

      setParsedData(result);
      setFormBrand(result.brandName);
      setFormDeliverables(result.deliverables);
      setFormAmount(result.paymentAmount);
      setFormDeadline(result.deadlineDate);
      setFormPaymentDue(result.paymentDueDate);
      setFormNotes(result.notes);
      setMissingFields(result.missingFields || []);
      
      onShowToast('Parsed details extracted!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('AI parsing failed. Falling back to local rules.', 'error');
      const fallback = parseMessageLocal(inputText);
      setParsedData(fallback);
      setFormBrand(fallback.brandName);
      setFormDeliverables(fallback.deliverables);
      setFormAmount(fallback.paymentAmount);
      setFormDeadline(fallback.deadlineDate);
      setFormPaymentDue(fallback.paymentDueDate);
      setFormNotes(fallback.notes);
      setMissingFields(fallback.missingFields || []);
    } finally {
      setIsParsing(false);
    }
  };

  // Re-calculate missing fields whenever form inputs change
  useEffect(() => {
    if (!parsedData) return;
    const missing = [];
    if (!formBrand.trim()) missing.push('brandName');
    if (!formDeliverables.trim()) missing.push('deliverables');
    if (!formAmount.trim()) missing.push('paymentAmount');
    if (!formDeadline) missing.push('deadlineDate');
    if (!formPaymentDue.trim()) missing.push('paymentDueDate');
    setMissingFields(missing);
  }, [formBrand, formDeliverables, formAmount, formDeadline, formPaymentDue, parsedData]);

  const handleConfirmSave = (e) => {
    e.preventDefault();
    
    // Check Freemium tier locking
    if (isFreeLocked) {
      onShowUpgradePrompt();
      return;
    }

    if (!formBrand.trim()) {
      onShowToast('Brand name is required.', 'error');
      return;
    }

    const deal = {
      id: Date.now().toString(),
      brandName: formBrand.trim(),
      deliverables: formDeliverables.trim() || 'Collaboration deliverables',
      paymentAmount: formAmount.trim() || 'TBD',
      deadlineDate: formDeadline, // YYYY-MM-DD
      paymentDueDate: formPaymentDue.trim() || 'TBD',
      notes: formNotes.trim(),
      status: 'New', // Default status in Kanban
      checklist: [
        { id: '1', text: 'Confirm collaboration terms', completed: false },
        { id: '2', text: 'Shoot content draft', completed: false },
        { id: '3', text: 'Submit draft for approval', completed: false },
        { id: '4', text: 'Publish post & send invoice', completed: false }
      ],
      createdAt: new Date().toISOString()
    };

    onSaveDeal(deal);
    // Clear state
    setInputText('');
    setParsedData(null);
  };

  return (
    <div className="parser-container">
      {/* Left Column: Text Paste and Parser trigger */}
      <div className="parser-card">
        <h2 className="parser-header-title">
          <Sparkles className="nav-icon" style={{ color: 'var(--primary)', animation: 'pulse 2s infinite' }} />
          AI Deal Parser
        </h2>
        <p className="settings-description" style={{ marginTop: '-0.5rem' }}>
          Paste any collaboration offer from Instagram DMs, email threads, or WhatsApp, and let DealDesk build your pipeline deal instantly.
        </p>

        <textarea
          className="parser-textarea"
          placeholder="Paste brand message email or DM here...&#10;e.g. 'Hey, we love your content! We want to offer you $400 for a Reel. Post must go live before July 15th...'"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="parser-templates">
          <span className="template-label">Try a Sample Pitch:</span>
          <div className="template-tags">
            {DEMO_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                className="template-btn"
                onClick={() => handleLoadTemplate(tmpl.text)}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleParse} 
          disabled={isParsing || !inputText.trim()}
          style={{ width: '100%', padding: '0.85rem' }}
        >
          {isParsing ? (
            <>
              <RefreshCw className="nav-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
              Parsing Brand Offer...
            </>
          ) : (
            <>
              <Sparkles className="nav-icon" />
              Parse Brand Message
              <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </>
          )}
        </button>
      </div>

      {/* Right Column: Editable Preview Form */}
      <div className="preview-card">
        {!parsedData ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '380px',
            color: 'var(--text-dark)',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <strong style={{ color: 'var(--text-muted)' }}>Deal Preview Panel</strong>
            <p className="settings-description" style={{ maxWidth: '280px', marginTop: '0.5rem' }}>
              Your structured deal preview will show up here once you paste and parse a brand proposal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <CheckCircle2 style={{ color: 'var(--success)' }} size={20} />
              Verify Deal Details
            </h3>

            {/* Brand Name Input */}
            <div className="form-group">
              <div className="form-label-wrap">
                <label className="form-label" htmlFor="preview-brand">Brand Name</label>
                {missingFields.includes('brandName') && (
                  <span className="field-warning-badge">
                    <AlertCircle className="warning-icon-sm" /> Not found
                  </span>
                )}
              </div>
              <input
                id="preview-brand"
                type="text"
                className={`form-input ${missingFields.includes('brandName') ? 'has-warning' : ''}`}
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. Nike"
                required
              />
            </div>

            {/* Deliverables Input */}
            <div className="form-group">
              <div className="form-label-wrap">
                <label className="form-label" htmlFor="preview-deliverables">Deliverables</label>
                {missingFields.includes('deliverables') && (
                  <span className="field-warning-badge">
                    <AlertCircle className="warning-icon-sm" /> Check info
                  </span>
                )}
              </div>
              <input
                id="preview-deliverables"
                type="text"
                className={`form-input ${missingFields.includes('deliverables') ? 'has-warning' : ''}`}
                value={formDeliverables}
                onChange={(e) => setFormDeliverables(e.target.value)}
                placeholder="e.g. 1 Reel + 2 Stories"
              />
            </div>

            {/* Amount / Budget Input */}
            <div className="form-group">
              <div className="form-label-wrap">
                <label className="form-label" htmlFor="preview-amount">Payment Amount</label>
                {missingFields.includes('paymentAmount') && (
                  <span className="field-warning-badge">
                    <AlertCircle className="warning-icon-sm" /> No budget found
                  </span>
                )}
              </div>
              <input
                id="preview-amount"
                type="text"
                className={`form-input ${missingFields.includes('paymentAmount') ? 'has-warning' : ''}`}
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="e.g. $400"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Deadline Date */}
              <div className="form-group">
                <div className="form-label-wrap">
                  <label className="form-label" htmlFor="preview-deadline">Deadline Date</label>
                  {missingFields.includes('deadlineDate') && (
                    <span className="field-warning-badge">
                      <AlertCircle className="warning-icon-sm" /> Missing date
                    </span>
                  )}
                </div>
                <input
                  id="preview-deadline"
                  type="date"
                  className={`form-input ${missingFields.includes('deadlineDate') ? 'has-warning' : ''}`}
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>

              {/* Payment Due Date / Terms */}
              <div className="form-group">
                <div className="form-label-wrap">
                  <label className="form-label" htmlFor="preview-due-date">Payment Terms</label>
                  {missingFields.includes('paymentDueDate') && (
                    <span className="field-warning-badge">
                      <AlertCircle className="warning-icon-sm" /> Net TBD
                    </span>
                  )}
                </div>
                <input
                  id="preview-due-date"
                  type="text"
                  className={`form-input ${missingFields.includes('paymentDueDate') ? 'has-warning' : ''}`}
                  value={formPaymentDue}
                  onChange={(e) => setFormPaymentDue(e.target.value)}
                  placeholder="e.g. Net 30"
                />
              </div>
            </div>

            {/* Special Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="preview-notes">Special Terms / Notes</label>
              <textarea
                id="preview-notes"
                className="form-input"
                style={{ height: '80px', resize: 'none' }}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Extract special requirements (exclusivity, links, draft review)..."
              />
            </div>

            {missingFields.length > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.75rem',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>We flagged {missingFields.length} field(s) we couldn't extract confidently. Please review/fill.</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <CheckCircle2 size={16} style={{ marginRight: '0.25rem' }} />
              Add Deal to Pipeline
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
