import React, { useState } from 'react';
import { X, CheckSquare, Square, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';

export default function DealModal({ 
  deal, 
  onClose, 
  onSave, 
  onDelete, 
  onGenerateInvoice 
}) {
  // Form states
  const [brandName, setBrandName] = useState(deal.brandName);
  const [deliverables, setDeliverables] = useState(deal.deliverables);
  const [paymentAmount, setPaymentAmount] = useState(deal.paymentAmount);
  const [deadlineDate, setDeadlineDate] = useState(deal.deadlineDate || '');
  const [paymentDueDate, setPaymentDueDate] = useState(deal.paymentDueDate || '');
  const [status, setStatus] = useState(deal.status);
  const [notes, setNotes] = useState(deal.notes || '');
  
  // Checklist state
  const [checklist, setChecklist] = useState(deal.checklist || []);
  const [newSubtask, setNewSubtask] = useState('');

  // Handle saving form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    
    const updatedDeal = {
      ...deal,
      brandName: brandName.trim(),
      deliverables: deliverables.trim(),
      paymentAmount: paymentAmount.trim(),
      deadlineDate,
      paymentDueDate: paymentDueDate.trim(),
      status,
      notes: notes.trim(),
      checklist
    };
    onSave(updatedDeal);
  };

  // Toggle subtask completion
  const handleToggleSubtask = (subtaskId) => {
    setChecklist(
      checklist.map(item => 
        item.id === subtaskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Add custom subtask
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newSubtask.trim(),
      completed: false
    };

    setChecklist([...checklist, newItem]);
    setNewSubtask('');
  };

  // Delete subtask
  const handleDeleteSubtask = (subtaskId) => {
    setChecklist(checklist.filter(item => item.id !== subtaskId));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Collaboration</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Primary Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-brand">Brand Name</label>
                <input
                  id="modal-brand"
                  type="text"
                  className="form-input"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-amount">Payment Amount</label>
                <input
                  id="modal-amount"
                  type="text"
                  className="form-input"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modal-deliverables">Deliverables</label>
              <input
                id="modal-deliverables"
                type="text"
                className="form-input"
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
              />
            </div>

            {/* Dates & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-deadline">Content Deadline</label>
                <input
                  id="modal-deadline"
                  type="date"
                  className="form-input"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-due">Payment Due Terms</label>
                <input
                  id="modal-due"
                  type="text"
                  className="form-input"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-status">Status</label>
                <select
                  id="modal-status"
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ appearance: 'none', WebkitAppearance: 'none', background: 'rgba(15, 23, 42, 0.45)' }}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Deliverables Checklist Generator */}
            <div className="checklist-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <span className="checklist-title">Production Checklist:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {checklist.map(item => (
                  <div key={item.id} className="checklist-item" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button 
                        type="button" 
                        onClick={() => handleToggleSubtask(item.id)} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: 'var(--primary)' }}
                      >
                        {item.completed ? <CheckSquare size={18} /> : <Square size={18} style={{ color: 'var(--text-dark)' }} />}
                      </button>
                      <span 
                        className={`checklist-label ${item.completed ? 'completed' : ''}`}
                        onClick={() => handleToggleSubtask(item.id)}
                      >
                        {item.text}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteSubtask(item.id)} 
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-dark)' }}
                      aria-label="Delete subtask"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="checklist-add-row">
                <input
                  type="text"
                  className="checklist-input"
                  placeholder="Add custom milestone (e.g. Shoot voiceover)..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddSubtask} style={{ padding: '0.3rem 0.8rem' }}>
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            {/* Special Terms & Notes */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <label className="form-label" htmlFor="modal-notes">Collaboration Notes</label>
              <textarea
                id="modal-notes"
                className="form-input"
                style={{ height: '100px', resize: 'none' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste contract details, caption drafts, hashtag lists, or shipment tracking numbers here..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={() => {
                if (window.confirm(`Delete collaboration with ${deal.brandName}?`)) {
                  onDelete(deal.id);
                }
              }}
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={16} />
              Delete
            </button>

            {status === 'Completed' && (
              <button 
                type="button" 
                className="btn" 
                onClick={() => onGenerateInvoice(deal)}
                style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}
              >
                <FileText size={16} />
                Generate Invoice
              </button>
            )}

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
