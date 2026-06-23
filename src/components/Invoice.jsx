import React, { useState } from 'react';
import { X, Printer, ArrowLeft } from 'lucide-react';

export default function Invoice({ deal, onClose, onShowToast }) {
  // Creator billing settings (editable directly on the invoice preview)
  const [creatorName, setCreatorName] = useState(localStorage.getItem('creatorName') || 'Student Creator');
  const [creatorEmail, setCreatorEmail] = useState(localStorage.getItem('creatorEmail') || 'creator@university.edu');
  const [paymentDetails, setPaymentDetails] = useState(
    localStorage.getItem('creatorPaymentDetails') || 'Venmo: @student-creator | PayPal: payments@creator.com'
  );

  const invoiceNumber = `DD-${deal.id.slice(-6)}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    // Save settings for next time
    localStorage.setItem('creatorName', creatorName);
    localStorage.setItem('creatorEmail', creatorEmail);
    localStorage.setItem('creatorPaymentDetails', paymentDetails);
    
    // Trigger standard browser print window
    window.print();
    onShowToast('Invoice print trigger launched!', 'success');
  };

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto', padding: '2rem 1rem' }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '850px', background: 'var(--bg-main)', border: '1px solid var(--panel-border)' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Invoice Actions Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 10 }}>
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="card-action-trigger" onClick={onClose} style={{ marginRight: '0.25rem' }} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
            Invoice Generator
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              Print / Save PDF
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Quick Creator Setup Form */}
          <div className="settings-card" style={{ padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <span className="template-label" style={{ fontSize: '0.7rem' }}>Customize Invoice Details:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  placeholder="Your Name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  placeholder="Your Email"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  placeholder="Payment Info (Venmo/PayPal)"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="invoice-print-container">
            {/* Header */}
            <div className="invoice-header">
              <div>
                <div className="invoice-logo">DEALDESK</div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Brand Collaboration Invoice</p>
              </div>
              <div className="invoice-meta">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> {invoiceNumber}</p>
                <p><strong>Date:</strong> {invoiceDate}</p>
              </div>
            </div>

            {/* Bill To / Bill From */}
            <div className="invoice-bill-row">
              <div className="invoice-bill-from">
                <h3>Issued By</h3>
                <p style={{ fontSize: '1.05rem', color: '#0f172a' }}>{creatorName}</p>
                <p style={{ color: '#475569' }}>{creatorEmail}</p>
              </div>
              <div className="invoice-bill-to">
                <h3>Billed To</h3>
                <p style={{ fontSize: '1.05rem', color: '#0f172a' }}>{deal.brandName}</p>
                <p style={{ color: '#475569' }}>Brand Marketing Representative</p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Content Collaboration Deliverables</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Deliverables: {deal.deliverables}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{deal.paymentAmount}</td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            <div className="invoice-total-row">
              <div className="invoice-total-label">Total Due:</div>
              <div className="invoice-total-value">{deal.paymentAmount}</div>
            </div>

            {/* Payment Details footer */}
            <div className="invoice-notes-footer">
              <p style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>Payment Terms: {deal.paymentDueDate || 'Net 30'}</p>
              <p>Please send payments via: {paymentDetails}</p>
              <p style={{ marginTop: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>Thank you for your collaboration!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
