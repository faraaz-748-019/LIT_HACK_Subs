import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Parser from './components/Parser';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import DealModal from './components/DealModal';
import Invoice from './components/Invoice';
import UpgradePrompt from './components/UpgradePrompt';
import Reminders from './components/Reminders';
import { KanbanSquare, Sparkles, LineChart, Settings as SettingsIcon, Bell, Sparkle, LogOut, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import './App.css';

export default function App() {
  // --- 1. State Hooks ---
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Deals State
  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem('dealdesk_deals');
    return saved ? JSON.parse(saved) : [];
  });

  // Freemium Pro Tier State
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem('dealdesk_ispro') === 'true';
  });

  // API Key State
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('dealdesk_geminikey') || '';
  });

  // Modals & Overlays
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [invoiceDeal, setInvoiceDeal] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Custom Toast Alerts
  const [toast, setToast] = useState(null);

  // --- 2. Side Effects ---
  useEffect(() => {
    localStorage.setItem('dealdesk_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('dealdesk_ispro', String(isPro));
  }, [isPro]);

  useEffect(() => {
    localStorage.setItem('dealdesk_geminikey', geminiKey);
  }, [geminiKey]);

  // Toast trigger helper
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- 3. Core Calculations ---
  const activeDealsCount = deals.filter(d => d.status !== 'Completed').length;
  // Free tier constraint: limit to 2 active deals
  const isFreeLocked = !isPro && activeDealsCount >= 2;

  // --- 4. Event Handlers ---
  const handleSaveNewDeal = (newDeal) => {
    setDeals([newDeal, ...deals]);
    setActiveTab('dashboard');
    triggerToast(`Added deal with ${newDeal.brandName} to pipeline!`, 'success');
  };

  const handleUpdateDeal = (updatedDeal) => {
    setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    setSelectedDeal(null);
    triggerToast('Deal changes saved successfully.', 'success');
  };

  const handleDeleteDeal = (dealId) => {
    setDeals(deals.filter(d => d.id !== dealId));
    setSelectedDeal(null);
    triggerToast('Collaboration deleted.', 'success');
  };

  const handleMoveDeal = (dealId, newStatus) => {
    // If upgrading is needed (e.g. dragging a completed deal back to active state when limit is reached)
    const dealToMove = deals.find(d => d.id === dealId);
    if (!dealToMove) return;

    if (dealToMove.status === 'Completed' && newStatus !== 'Completed') {
      // Trying to move a completed deal to an active column
      if (!isPro && activeDealsCount >= 2) {
        setShowUpgradeModal(true);
        triggerToast('Active deal limit (2) reached! Upgrade to move.', 'error');
        return;
      }
    }

    setDeals(deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
    triggerToast(`Status updated to ${newStatus}.`, 'success');
  };

  const handleGenerateInvoice = (deal) => {
    if (!isPro) {
      setShowUpgradeModal(true);
      triggerToast('Invoice generation is a Pro feature.', 'error');
      return;
    }
    setInvoiceDeal(deal);
  };

  const handleUpgrade = () => {
    setIsPro(true);
    triggerToast('You have successfully upgraded to Pro!', 'success');
  };

  const handleResetData = () => {
    setDeals([]);
    setIsPro(false);
    setGeminiKey('');
    setSelectedDeal(null);
    setInvoiceDeal(null);
    localStorage.removeItem('creatorName');
    localStorage.removeItem('creatorEmail');
    localStorage.removeItem('creatorPaymentDetails');
  };

  return (
    <div className="app-container">
      {/* 1. Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo-icon">D</div>
          <span className="brand-name">DealDesk</span>
        </div>

        <nav style={{ width: '100%' }}>
          <ul className="nav-links">
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <KanbanSquare className="nav-icon" />
              Deals Board
            </li>
            <li 
              className={`nav-item ${activeTab === 'parser' ? 'active' : ''}`}
              onClick={() => setActiveTab('parser')}
            >
              <Sparkles className="nav-icon" />
              AI Parser
            </li>
            <li 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <LineChart className="nav-icon" />
              Earnings
              {!isPro && <span className="pro-badge" style={{ padding: '0.1rem 0.35rem', fontSize: '0.55rem' }}>Lock</span>}
            </li>
            <li 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <SettingsIcon className="nav-icon" />
              Settings
            </li>
          </ul>
        </nav>

        {/* Sidebar Freemium status footer */}
        <div className="sidebar-footer">
          <div className="user-tier-info">
            <span className="tier-label">Your Tier</span>
            <div className="tier-value">
              {isPro ? 'Pro Member' : 'Free Member'}
              {isPro ? (
                <Sparkle size={14} style={{ color: 'var(--accent)' }} />
              ) : (
                <span className="column-count" style={{ fontSize: '0.65rem' }}>{activeDealsCount}/2</span>
              )}
            </div>
            {!isPro && (
              <button className="upgrade-btn-sidebar" onClick={() => setShowUpgradeModal(true)}>
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Content Grid */}
      <main className="main-content">
        {/* Dynamic Navigation Header */}
        <div className="header-row">
          <div>
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'parser' && 'AI Message Parser'}
              {activeTab === 'analytics' && 'Earnings Analytics'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="settings-description" style={{ marginTop: '0.15rem' }}>
              {activeTab === 'dashboard' && 'Drag cards to manage milestones. Tap a card to edit deliverables checklist.'}
              {activeTab === 'parser' && 'Turn chaotic brand pitches from DMs or emails into structured deals.'}
              {activeTab === 'analytics' && 'Review your sponsor payouts and pipeline metrics.'}
              {activeTab === 'settings' && 'Manage API connections and set subscription tier states.'}
            </p>
          </div>

          <div className="header-actions">
            {activeTab === 'dashboard' && (
              <button className="btn btn-primary" onClick={() => setActiveTab('parser')}>
                <Plus size={16} />
                Add Brand Deal
              </button>
            )}
          </div>
        </div>

        {/* Active Tab rendering */}
        {activeTab === 'dashboard' && (
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'start',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            {/* Dashboard Columns (Kanban) */}
            <div style={{ flexGrow: 1, minWidth: '320px' }}>
              <Dashboard
                deals={deals}
                onMoveDeal={handleMoveDeal}
                onSelectDeal={setSelectedDeal}
                onGenerateInvoice={handleGenerateInvoice}
                onNavigateToParser={() => setActiveTab('parser')}
              />
            </div>
            {/* Reminders list panel */}
            <div style={{ width: '320px', flexShrink: 0 }} className="responsive-full-width">
              <Reminders
                deals={deals}
                onSelectDeal={setSelectedDeal}
              />
            </div>
          </div>
        )}

        {activeTab === 'parser' && (
          <Parser
            geminiKey={geminiKey}
            onSaveDeal={handleSaveNewDeal}
            onShowToast={triggerToast}
            isFreeLocked={isFreeLocked}
            onShowUpgradePrompt={() => setShowUpgradeModal(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            deals={deals}
            isPro={isPro}
            onUpgrade={handleUpgrade}
            onShowToast={triggerToast}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            isPro={isPro}
            setIsPro={setIsPro}
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
            onResetData={handleResetData}
            onShowToast={triggerToast}
          />
        )}
      </main>

      {/* --- 5. Popups & Overlays Modals --- */}

      {/* Detail View modal */}
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onSave={handleUpdateDeal}
          onDelete={handleDeleteDeal}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {/* Invoice modal */}
      {invoiceDeal && (
        <Invoice
          deal={invoiceDeal}
          onClose={() => setInvoiceDeal(null)}
          onShowToast={triggerToast}
        />
      )}

      {/* Upgrade Limit notification modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Global Toast Banner Alert */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : 'success'}`}>
          {toast.type === 'error' ? (
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
          ) : (
            <CheckCircle size={18} style={{ color: 'var(--success)' }} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
