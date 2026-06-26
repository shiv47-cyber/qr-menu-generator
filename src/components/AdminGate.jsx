import React, { useState } from 'react';

export default function AdminGate({ savedPin, onSetupPin, onVerifySuccess }) {
  const [mode, setMode] = useState(savedPin ? 'landing' : 'setup-create'); // 'landing' | 'setup-create' | 'setup-confirm' | 'login'
  const [pinBuffer, setPinBuffer] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleKeyPress = (num) => {
    setErrorMsg('');
    if (pinBuffer.length >= 4) return;
    const newBuffer = pinBuffer + num;
    setPinBuffer(newBuffer);

    // If we reached 4 digits, process it
    if (newBuffer.length === 4) {
      // Small timeout so the user sees the last dot light up before transition
      setTimeout(() => {
        processPin(newBuffer);
      }, 200);
    }
  };

  const handleBackspace = () => {
    setPinBuffer(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const processPin = (enteredPin) => {
    if (mode === 'setup-create') {
      setTempPin(enteredPin);
      setPinBuffer('');
      setMode('setup-confirm');
    } 
    else if (mode === 'setup-confirm') {
      if (enteredPin === tempPin) {
        onSetupPin(enteredPin);
      } else {
        setErrorMsg("PINs do not match. Start over.");
        setPinBuffer('');
        setTempPin('');
        setMode('setup-create');
      }
    } 
    else if (mode === 'login') {
      if (enteredPin === savedPin) {
        onVerifySuccess();
      } else {
        setErrorMsg("Incorrect passcode. Try again.");
        setPinBuffer('');
      }
    }
  };

  // Rendering Helper for PIN dots
  const renderDots = () => {
    return (
      <div className="pin-display-wrapper">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`pin-dot ${i < pinBuffer.length ? 'active' : ''}`}
          />
        ))}
      </div>
    );
  };

  // Rendering Helper for Keypad
  const renderKeypad = () => {
    return (
      <div className="pin-keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            type="button" 
            className="keypad-btn"
            onClick={() => handleKeyPress(num.toString())}
          >
            {num}
          </button>
        ))}
        <button 
          type="button" 
          className="keypad-btn" 
          style={{ fontSize: '1rem', border: 'none', background: 'none' }}
          onClick={() => {
            setPinBuffer('');
            setErrorMsg('');
            if (mode === 'login') setMode('landing');
            else if (mode === 'setup-confirm') {
              setMode('setup-create');
              setTempPin('');
            }
          }}
        >
          Cancel
        </button>
        <button 
          key={0} 
          type="button" 
          className="keypad-btn"
          onClick={() => handleKeyPress('0')}
        >
          0
        </button>
        <button 
          type="button" 
          className="keypad-btn"
          style={{ fontSize: '1.25rem' }}
          onClick={handleBackspace}
          title="Backspace"
        >
          ⌫
        </button>
      </div>
    );
  };

  // 1. LANDING PAGE VIEW
  if (mode === 'landing') {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Landing Hero */}
        <section className="landing-banner">
          <div className="logo-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem', margin: '0 auto 16px auto' }}>🍽️</div>
          <h1>MenuQR Creator</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Create, manage, and instantly generate contactless QR codes for your restaurant menu.
          </p>
        </section>

        {/* Feature Cards Grid */}
        <div className="landing-grid">
          <div className="landing-card">
            <div className="landing-card-icon">📂</div>
            <h3>Manage Sections</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Organize your items into categories like Starters, Mains, Desserts, and Drinks.
            </p>
          </div>
          <div className="landing-card">
            <div className="landing-card-icon">⚡</div>
            <h3>Instant QR Code</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your entire menu is encoded inside a single QR code. Print it, place it on tables, and you're good to go!
            </p>
          </div>
          <div className="landing-card">
            <div className="landing-card-icon">🎨</div>
            <h3>Theme Accents</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Match your brand identity by selecting beautiful Emerald, Amber, Rose, or Indigo color accents.
            </p>
          </div>
        </div>

        {/* Action Button to Open Login */}
        <div className="flex justify-center" style={{ marginBottom: '40px' }}>
          <button 
            onClick={() => setMode('login')} 
            className="btn btn-primary"
            style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}
          >
            🔒 Go to Admin Dashboard
          </button>
        </div>

        <footer className="footer">
          <p>If you are a customer, please scan the QR code printed at your table to view the menu directly.</p>
        </footer>
      </div>
    );
  }

  // 2. PASSCODE ENTRY SCREEN (Setup or Login)
  return (
    <div className="gate-wrapper">
      <div className="gate-card">
        <div className="gate-icon">
          {mode === 'login' ? '🔒' : '🔑'}
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            {mode === 'setup-create' && 'Create Admin Passcode'}
            {mode === 'setup-confirm' && 'Confirm Admin Passcode'}
            {mode === 'login' && 'Admin Login'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'setup-create' && 'Set a 4-digit PIN to secure your editing dashboard.'}
            {mode === 'setup-confirm' && 'Please re-enter your 4-digit PIN to confirm.'}
            {mode === 'login' && 'Enter your 4-digit PIN to access the editing dashboard.'}
          </p>
        </div>

        {renderDots()}

        {errorMsg && (
          <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginTop: '-12px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {renderKeypad()}
      </div>
    </div>
  );
}
