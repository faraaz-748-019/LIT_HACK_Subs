import React from 'react';
import { Bell, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getDaysRemaining } from './Dashboard';

export default function Reminders({ deals, onSelectDeal }) {
  // Generate list of active reminder alerts
  const alerts = [];

  deals.forEach(deal => {
    // 1. Deadline reminders (applicable for non-completed deals)
    if (deal.status !== 'Completed' && deal.deadlineDate) {
      const days = getDaysRemaining(deal.deadlineDate);
      if (days !== null) {
        if (days < 0) {
          alerts.push({
            type: 'deadline-overdue',
            urgency: 'critical',
            title: `Submission Overdue!`,
            text: `${deal.brandName} content was due ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago.`,
            badgeText: `${Math.abs(days)}d Overdue`,
            deal: deal,
            sortWeight: -100 + days // Overdue are most urgent, smaller days (more overdue) first
          });
        } else if (days === 0) {
          alerts.push({
            type: 'deadline-today',
            urgency: 'critical',
            title: `Post Due Today!`,
            text: `Publish and submit ${deal.brandName} draft now.`,
            badgeText: 'Today',
            deal: deal,
            sortWeight: 0
          });
        } else if (days === 1) {
          alerts.push({
            type: 'deadline-tomorrow',
            urgency: 'critical',
            title: `Deadline Tomorrow`,
            text: `Finish editing for ${deal.brandName} collaboration.`,
            badgeText: 'Tomorrow',
            deal: deal,
            sortWeight: 1
          });
        } else if (days <= 2) {
          alerts.push({
            type: 'deadline-soon',
            urgency: 'critical',
            title: `Deadline in 2 days`,
            text: `${deal.brandName} post deadline is approaching.`,
            badgeText: `${days} days left`,
            deal: deal,
            sortWeight: 2
          });
        } else if (days <= 5) {
          alerts.push({
            type: 'deadline-upcoming',
            urgency: 'warning',
            title: `Upcoming Deadline`,
            text: `${deal.brandName} deliverables due in ${days} days.`,
            badgeText: `${days}d left`,
            deal: deal,
            sortWeight: days
          });
        }
      }
    }

    // 2. Payment reminders
    if (deal.status === 'Awaiting Payment') {
      alerts.push({
        type: 'payment-pending',
        urgency: 'warning',
        title: `Awaiting Brand Payment`,
        text: `Follow up with ${deal.brandName} for ${deal.paymentAmount} (${deal.paymentDueDate || 'Net TBD'}).`,
        badgeText: 'Invoice Sent',
        deal: deal,
        sortWeight: 10 // Sorted after active deadlines
      });
    }
  });

  // Sort alerts by urgency weight
  const sortedAlerts = alerts.sort((a, b) => a.sortWeight - b.sortWeight);

  return (
    <div className="reminders-panel">
      <div className="reminders-header">
        <h3 className="reminders-title">
          <Bell className="nav-icon" style={{ color: 'var(--primary)', animation: sortedAlerts.length > 0 ? 'swing 2s infinite' : 'none' }} />
          Urgent Action Items
        </h3>
        <span className="column-count" style={{ 
          background: sortedAlerts.length > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.05)', 
          color: sortedAlerts.length > 0 ? 'var(--danger)' : 'var(--text-muted)'
        }}>
          {sortedAlerts.length}
        </span>
      </div>

      <div className="reminders-list">
        {sortedAlerts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-dark)'
          }}>
            <CheckCircle2 size={32} style={{ color: 'var(--success)', opacity: 0.6, marginBottom: '0.5rem' }} />
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All caught up!</strong>
            <span style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>No critical deadlines or pending payments.</span>
          </div>
        ) : (
          sortedAlerts.map((alert, idx) => (
            <div 
              key={idx} 
              className="reminder-item"
              onClick={() => onSelectDeal(alert.deal)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`reminder-indicator ${alert.urgency}`} />
              <div className="reminder-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="reminder-brand">{alert.title}</span>
                  <span className={`reminder-time-badge ${alert.urgency}`}>
                    {alert.badgeText}
                  </span>
                </div>
                <p className="reminder-text">{alert.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--primary)' }}>
                  <span>View deal details</span>
                  <ArrowRight size={10} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
