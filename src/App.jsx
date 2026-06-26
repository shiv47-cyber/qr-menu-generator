import React, { useState, useEffect } from 'react';
import MerchantDashboard from './components/MerchantDashboard';
import CustomerMenu from './components/CustomerMenu';
import AdminGate from './components/AdminGate';
import { DEFAULT_MENU, decodeMenu } from './utils/menuEncoder';

const LOCAL_STORAGE_KEY = 'qr-menu-generator-data';

export default function App() {
  const [viewMode, setViewMode] = useState('merchant'); // 'merchant' | 'customer'
  const [customerMenuData, setCustomerMenuData] = useState(null);
  const [isMerchantPreview, setIsMerchantPreview] = useState(false);
  const [merchantMenuData, setMerchantMenuData] = useState(() => {
    // Load from localStorage or fall back to default menu
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_MENU;
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return DEFAULT_MENU;
    }
  });

  // Admin session authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('qr-menu-admin-authenticated') === 'true';
  });

  // Handle URL parsing on mount and on popstate (browser back/forward navigation)
  useEffect(() => {
    const handleUrlRouting = () => {
      const params = new URLSearchParams(window.location.search);
      const menuParam = params.get('menu');
      const isPreview = params.get('preview') === 'true';
      
      if (menuParam) {
        const decoded = decodeMenu(menuParam);
        if (decoded) {
          setCustomerMenuData(decoded);
          setIsMerchantPreview(isPreview);
          setViewMode('customer');
          return;
        }
      }
      
      // If no valid menu param, default to merchant dashboard
      setViewMode('merchant');
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const handleSaveMenu = (updatedMenu) => {
    setMerchantMenuData(updatedMenu);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMenu));
    } catch (e) {
      console.error("Error writing to localStorage:", e);
    }
  };

  const handleBackToDashboard = () => {
    // Clean URL search parameters and return to merchant dashboard view
    const newUrl = window.location.origin + window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setViewMode('merchant');
  };

  const handleVerifySuccess = () => {
    sessionStorage.setItem('qr-menu-admin-authenticated', 'true');
    setIsAuthenticated(true);
  };

  // 1. Render Customer View if menu is in URL
  if (viewMode === 'customer' && customerMenuData) {
    return (
      <CustomerMenu 
        menuData={customerMenuData} 
        onBackToDashboard={isMerchantPreview ? handleBackToDashboard : null}
      />
    );
  }

  // 2. Render Passcode Gate / Landing Page if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminGate 
        onVerifySuccess={handleVerifySuccess}
      />
    );
  }

  // 3. Render Merchant Dashboard if authenticated
  return (
    <MerchantDashboard 
      initialMenu={merchantMenuData} 
      onSave={handleSaveMenu}
    />
  );
}
