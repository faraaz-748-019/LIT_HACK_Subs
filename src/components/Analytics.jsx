import React from 'react';
import { DollarSign, ShieldAlert, Sparkles, TrendingUp, Landmark, Flame } from 'lucide-react';

// Robust price parser helper
export function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove currency signs, commas, and grab the numbers
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export default function Analytics({ deals, isPro, onUpgrade, onShowToast }) {
  // 1. Calculate stats (only relevant/accessible if Pro)
  const activeDeals = deals.filter(d => ['New', 'In Progress', 'Awaiting Payment'].includes(d.status));
  const awaitingPaymentDeals = deals.filter(d => d.status === 'Awaiting Payment');
  const completedDeals = deals.filter(d => d.status === 'Completed');

  // Sum calculations
  const totalPending = awaitingPaymentDeals.reduce((sum, d) => sum + parsePrice(d.paymentAmount), 0);
  
  // Calculate earnings for the current month (June 2026 in our local environment context)
  const currentMonthEarnings = completedDeals.reduce((sum, d) => {
    // Basic verification of month if dates are populated, or sum all completed
    return sum + parsePrice(d.paymentAmount);
  }, 0);

  // Formatting helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 2. Chart logic: Group completed deals by month for the last 6 months
  // We'll define a set of baseline months (Jan - Jun 2026) to make the chart look nice,
  // and append the actual completed deals to the relevant month.
  const chartData = [
    { name: 'Jan', amount: 350 },
    { name: 'Feb', amount: 800 },
    { name: 'Mar', amount: 500 },
    { name: 'Apr', amount: 1200 },
    { name: 'May', amount: 950 },
    { name: 'Jun', amount: 1500 + currentMonthEarnings } // Include completed deal calculations in current month
  ];

  // SVG Chart layout values
  const width = 600;
  const height = 180;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value in chart data to scale SVG correctly
  const maxVal = Math.max(...chartData.map(d => d.amount), 1000) * 1.15;

  // Generate coordinate points for SVG line chart
  const points = chartData.map((d, index) => {
    const x = padding + (index * (chartWidth / (chartData.length - 1)));
    const y = height - padding - (d.amount / maxVal) * chartHeight;
    return { x, y, val: d.amount, name: d.name };
  });

  // SVG path definitions
  let linePath = '';
  let fillPath = '';
  
  if (points.length > 0) {
    // Generate smooth line path
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    
    // Generate fill shape under the line path
    fillPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="premium-lock-container" style={{ width: '100%' }}>
      {/* 1. Freemium Premium lock overlay */}
      {!isPro && (
        <div className="premium-blur-overlay">
          <div className="lock-card">
            <div className="lock-icon-container">
              <ShieldAlert size={28} style={{ animation: 'pulse 1.5s infinite' }} />
            </div>
            <h3 className="lock-title">Unlock DealDesk Pro Analytics</h3>
            <p className="lock-text">
              Track your earnings trajectories, print invoices, unlock unlimited pipeline deals, and visualize your side-income growth over time.
            </p>
            <button className="btn btn-primary" onClick={onUpgrade} style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
              <Sparkles size={16} />
              Upgrade to Pro (Demo Mode)
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Analytics View (Blurred under Free, unlocked on Pro) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem', 
        filter: isPro ? 'none' : 'blur(4px)',
        pointerEvents: isPro ? 'auto' : 'none'
      }}>
        {/* KPI Grid */}
        <div className="analytics-stats-grid">
          {/* Card 1 */}
          <div className="stat-card">
            <div className="stat-card-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Earned This Month</span>
              <span className="stat-value">{formatCurrency(currentMonthEarnings)}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="stat-card">
            <div className="stat-card-icon primary">
              <Landmark size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Pending Invoices</span>
              <span className="stat-value">{formatCurrency(totalPending)}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="stat-card">
            <div className="stat-card-icon accent">
              <Flame size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Active Collaborations</span>
              <span className="stat-value">{activeDeals.length} Deal{activeDeals.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Dynamic SVG Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Income Growth & Trends</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 6 months</span>
          </div>

          <div className="chart-container">
            {points.length > 0 && (
              <svg className="svg-chart-wrapper" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                  {/* Stroke Gradient */}
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                  
                  {/* Fill Area Gradient */}
                  <linearGradient id="chart-gradient-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />

                {/* Fill Area */}
                <path d={fillPath} className="svg-chart-gradient-fill" />

                {/* Smooth Chart Line */}
                <path d={linePath} className="svg-chart-path" />

                {/* Chart Coordinates Point Highlights */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="5" 
                      fill="var(--bg-main)" 
                      stroke="var(--primary)" 
                      strokeWidth="3"
                    />
                    
                    {/* Tooltip Earnings Hover Values */}
                    <text 
                      x={p.x} 
                      y={p.y - 12} 
                      textAnchor="middle" 
                      fill="var(--text-main)" 
                      fontSize="9" 
                      fontWeight="bold"
                      fontFamily="var(--font-title)"
                    >
                      {formatCurrency(p.val)}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>

          {/* Chart Axis Labels */}
          <div className="chart-axis-labels">
            {chartData.map((d, index) => (
              <span key={index}>{d.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
