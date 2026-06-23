import React, { useState } from 'react';
import { Calendar, MoreVertical, FileSpreadsheet, Plus, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

const COLUMNS = [
  { id: 'New', name: 'New', dotClass: 'new' },
  { id: 'In Progress', name: 'In Progress', dotClass: 'progress' },
  { id: 'Awaiting Payment', name: 'Awaiting Payment', dotClass: 'payment' },
  { id: 'Completed', name: 'Completed', dotClass: 'complete' }
];

// Helper to calculate days remaining
export function getDaysRemaining(deadlineDateStr) {
  if (!deadlineDateStr) return null;
  const deadline = new Date(deadlineDateStr);
  
  // Set time of both dates to midnight to compare days accurately
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper to render the deadline badge
function DeadlineBadge({ deadlineDateStr }) {
  const days = getDaysRemaining(deadlineDateStr);
  
  if (days === null) {
    return (
      <div className="card-date-badge">
        <Calendar className="card-badge-icon" />
        <span>No deadline</span>
      </div>
    );
  }

  if (days < 0) {
    const absDays = Math.abs(days);
    return (
      <div className="card-date-badge urgent">
        <AlertTriangle className="card-badge-icon" />
        <span>Overdue by {absDays} day{absDays !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  if (days === 0) {
    return (
      <div className="card-date-badge urgent">
        <Calendar className="card-badge-icon" />
        <span>Due today!</span>
      </div>
    );
  }

  if (days === 1) {
    return (
      <div className="card-date-badge urgent">
        <Calendar className="card-badge-icon" />
        <span>Due tomorrow</span>
      </div>
    );
  }

  if (days <= 2) {
    return (
      <div className="card-date-badge urgent">
        <Calendar className="card-badge-icon" />
        <span>{days} days left</span>
      </div>
    );
  }

  if (days <= 5) {
    return (
      <div className="card-date-badge warning">
        <Calendar className="card-badge-icon" />
        <span>{days} days left</span>
      </div>
    );
  }

  return (
    <div className="card-date-badge">
      <Calendar className="card-badge-icon" />
      <span>{days} days left</span>
    </div>
  );
}

export default function Dashboard({ 
  deals, 
  onMoveDeal, 
  onSelectDeal, 
  onGenerateInvoice,
  onNavigateToParser 
}) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null); // Mobile menu helper

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (e, dealId) => {
    setDraggingId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
    // Firefox compatibility
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggingId;
    if (dealId) {
      onMoveDeal(dealId, targetColumnId);
    }
    setDraggingId(null);
    setDragOverColumn(null);
  };

  // Toggle quick-action menu for mobile/touch
  const toggleMobileMenu = (e, dealId) => {
    e.stopPropagation(); // Stop opening the modal
    setActiveMenuId(activeMenuId === dealId ? null : dealId);
  };

  const handleMobileMove = (dealId, status) => {
    onMoveDeal(dealId, status);
    setActiveMenuId(null);
  };

  const hasDeals = deals.length > 0;

  if (!hasDeals) {
    return (
      <div className="empty-state">
        <Plus className="empty-state-icon" style={{ animation: 'bounce 2.5s infinite' }} />
        <h2 className="empty-state-title">Welcome to DealDesk!</h2>
        <p className="empty-state-text">
          Track all your Instagram, YouTube, and TikTok collaborations in one visual pipeline. 
          Get started by parsing a brand proposal message.
        </p>
        <button className="btn btn-primary" onClick={onNavigateToParser}>
          Paste a brand message to add your first deal
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colDeals = deals.filter(d => d.status === col.id);

        return (
          <div 
            key={col.id} 
            className={`kanban-column ${dragOverColumn === col.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header">
              <div className="column-title-wrap">
                <span className={`column-dot ${col.dotClass}`}></span>
                <span className="column-name">{col.name}</span>
              </div>
              <span className="column-count">{colDeals.length}</span>
            </div>

            <div className="column-cards-container">
              {colDeals.map(deal => {
                const days = getDaysRemaining(deal.deadlineDate);
                const isOverdue = days !== null && days < 0;
                const isAwaitingPayment = deal.status === 'Awaiting Payment';
                
                return (
                  <div
                    key={deal.id}
                    className={`deal-card ${draggingId === deal.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectDeal(deal)}
                  >
                    {/* Visual warning border for urgency */}
                    {isOverdue && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: 'var(--danger)'
                      }} />
                    )}
                    {isAwaitingPayment && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: 'var(--warning)'
                      }} />
                    )}

                    <div className="card-top">
                      <h4 className="card-brand">{deal.brandName}</h4>
                      <span className="card-amount">{deal.paymentAmount}</span>
                    </div>

                    <div className="card-deliverables">
                      <FileSpreadsheet className="card-deliverable-icon" />
                      <span>{deal.deliverables}</span>
                    </div>

                    <div className="card-footer">
                      <DeadlineBadge deadlineDateStr={deal.deadlineDate} />
                      
                      <button 
                        className="card-action-trigger" 
                        onClick={(e) => toggleMobileMenu(e, deal.id)}
                        aria-label="Move deal status options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Mobile Move Dropdown Menu */}
                      {activeMenuId === deal.id && (
                        <div 
                          className="mobile-move-dropdown"
                          onClick={(e) => e.stopPropagation()} // Stop closing dropdown
                        >
                          <span style={{ 
                            fontSize: '0.65rem', 
                            color: 'var(--text-dark)', 
                            padding: '0.2rem 0.5rem',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                          }}>
                            Move status:
                          </span>
                          {COLUMNS.filter(c => c.id !== deal.status).map(targetCol => (
                            <button
                              key={targetCol.id}
                              className="mobile-move-btn"
                              onClick={() => handleMobileMove(deal.id, targetCol.id)}
                            >
                              To {targetCol.name}
                            </button>
                          ))}
                          {deal.status === 'Completed' && (
                            <button
                              className="mobile-move-btn"
                              style={{ color: 'var(--success)', borderTop: '1px solid var(--border-color)', marginTop: '0.2rem' }}
                              onClick={() => {
                                onGenerateInvoice(deal);
                                setActiveMenuId(null);
                              }}
                            >
                              Get Invoice
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {colDeals.length === 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem 1rem',
                  color: 'var(--text-dark)',
                  fontSize: '0.85rem',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  Drop deals here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
