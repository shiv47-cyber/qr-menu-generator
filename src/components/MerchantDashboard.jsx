import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { encodeMenu } from '../utils/menuEncoder';

export default function MerchantDashboard({ initialMenu, onSave }) {
  const [menu, setMenu] = useState(initialMenu);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  
  // Section Form state
  const [sectionFormName, setSectionFormName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);

  // Item Form state
  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    isVeg: true
  });
  const [targetSectionId, setTargetSectionId] = useState(null);

  // QR Code Generation
  const customerUrl = (() => {
    const encoded = encodeMenu(menu);
    const origin = window.location.origin + window.location.pathname;
    return encoded ? `${origin}?menu=${encoded}` : origin;
  })();

  const previewUrl = customerUrl ? `${customerUrl}&preview=true` : '';

  useEffect(() => {
    if (customerUrl) {
      QRCode.toDataURL(customerUrl, { width: 300, margin: 2, errorCorrectionLevel: 'L' }, (err, url) => {
        if (err) console.error("QR Code Error:", err);
        else setQrCodeUrl(url);
      });
    }
    // Auto-save menu to localStorage on changes
    onSave(menu);
  }, [menu, customerUrl]);

  // Section Handlers
  const handleAddSectionClick = () => {
    setEditingSectionId(null);
    setSectionFormName('');
    setShowSectionModal(true);
  };

  const handleEditSectionClick = (section) => {
    setEditingSectionId(section.id);
    setSectionFormName(section.name);
    setShowSectionModal(true);
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    if (!sectionFormName.trim()) return;

    if (editingSectionId) {
      // Edit
      setMenu(prev => ({
        ...prev,
        sections: prev.sections.map(sec => 
          sec.id === editingSectionId ? { ...sec, name: sectionFormName } : sec
        )
      }));
    } else {
      // Add
      const newSec = {
        id: `sec-${Date.now()}`,
        name: sectionFormName,
        items: []
      };
      setMenu(prev => ({
        ...prev,
        sections: [...prev.sections, newSec]
      }));
    }
    setShowSectionModal(false);
    setSectionFormName('');
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section and all its items?")) {
      setMenu(prev => ({
        ...prev,
        sections: prev.sections.filter(sec => sec.id !== sectionId)
      }));
    }
  };

  // Item Handlers
  const handleAddItemClick = (sectionId) => {
    setTargetSectionId(sectionId);
    setItemForm({ id: '', name: '', description: '', price: '', isVeg: true });
    setShowItemModal(true);
  };

  const handleEditItemClick = (sectionId, item) => {
    setTargetSectionId(sectionId);
    setItemForm({ ...item });
    setShowItemModal(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.price) return;

    setMenu(prev => {
      const updatedSections = prev.sections.map(sec => {
        if (sec.id !== targetSectionId) return sec;

        let updatedItems;
        if (itemForm.id) {
          // Editing existing item
          updatedItems = sec.items.map(it => it.id === itemForm.id ? itemForm : it);
        } else {
          // Adding new item
          const newItem = {
            ...itemForm,
            id: `item-${Date.now()}`
          };
          updatedItems = [...sec.items, newItem];
        }

        return { ...sec, items: updatedItems };
      });

      return { ...prev, sections: updatedSections };
    });

    setShowItemModal(false);
  };

  const handleDeleteItem = (sectionId, itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setMenu(prev => ({
        ...prev,
        sections: prev.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            items: sec.items.filter(it => it.id !== itemId)
          };
        })
      }));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerUrl);
    alert("Customer menu link copied to clipboard!");
  };

  return (
    <div className={`theme-${menu.theme || 'emerald'}`}>
      
      {/* Header navbar */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🍽️</div>
          <span>MenuQR Creator</span>
        </div>
        
        <div className="flex align-center gap-4">
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Theme:</span>
          <div className="theme-picker">
            {['emerald', 'amber', 'rose', 'indigo'].map(t => (
              <button 
                key={t}
                onClick={() => setMenu(prev => ({ ...prev, theme: t }))}
                className={`theme-btn theme-${t} ${menu.theme === t ? 'active' : ''}`}
                style={{ backgroundColor: `var(--primary)` }}
                title={`Theme ${t}`}
              />
            ))}
          </div>
          <a 
            href={previewUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-sm"
          >
            👁️ Live Preview
          </a>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="app-container">
        
        {/* Banner Card */}
        <section className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, var(--primary-light), transparent)' }}>
          <div className="flex flex-col gap-4">
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
              Create Your Digital QR Menu
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
              Customize sections, add dishes with pricing, and customize your visual theme. Customers can scan the generated QR code instantly to view your menu on their mobile devices.
            </p>
            
            <div className="form-group" style={{ maxWidth: '400px', marginTop: '8px' }}>
              <label className="form-label" htmlFor="restaurant-name-input">Restaurant Name</label>
              <input 
                id="restaurant-name-input"
                type="text" 
                className="form-input" 
                value={menu.restaurantName}
                onChange={(e) => setMenu(prev => ({ ...prev, restaurantName: e.target.value }))}
                placeholder="Enter Restaurant Name"
                style={{ fontWeight: 600, fontSize: '1.1rem' }}
              />
            </div>
          </div>
        </section>

        {/* Dashboard Grid layout */}
        <div className="grid-dashboard">
          
          {/* Left Column: Menu Sections and Items Editor */}
          <section className="flex flex-col gap-6">
            <div className="flex justify-between align-center">
              <h2>Menu Sections</h2>
              <button className="btn btn-primary btn-sm" onClick={handleAddSectionClick}>
                ➕ Add Section
              </button>
            </div>

            <div className="sections-editor-list">
              {menu.sections.length > 0 ? (
                menu.sections.map(section => (
                  <div key={section.id} className="section-editor-item">
                    
                    {/* Section Header */}
                    <div className="section-editor-header">
                      <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📁 {section.name}
                      </h3>
                      
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAddItemClick(section.id)}
                        >
                          ➕ Add Item
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditSectionClick(section)}
                          title="Rename Section"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSection(section.id)}
                          title="Delete Section"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Section Items */}
                    <div className="merchant-item-list">
                      {section.items.length > 0 ? (
                        section.items.map(item => (
                          <div key={item.id} className="merchant-item-row">
                            <div className="merchant-item-info">
                              <span className="merchant-item-name">
                                {item.name} 
                                <span 
                                  className={`badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'}`} 
                                  style={{ marginLeft: '8px', fontSize: '0.65rem', padding: '2px 4px' }}
                                >
                                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                                </span>
                              </span>
                              <span className="merchant-item-price">${parseFloat(item.price).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleEditItemClick(section.id, item)}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                className="btn btn-danger btn-sm" 
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteItem(section.id, item.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
                          No items in this section yet. Click "Add Item" to add some!
                        </div>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📂 Your menu is empty</p>
                  <p>Click "Add Section" to create categories like Starters, Mains, and Drinks.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: QR Code Box */}
          <section className="flex flex-col gap-6" style={{ marginTop: '32px' }}>
            <div className="card" style={{ position: 'sticky', top: '90px' }}>
              <h2 className="card-title">Generated QR Code</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                This QR code points to your menu. Print this out and place it on restaurant tables!
              </p>

              <div className="qr-container">
                {qrCodeUrl ? (
                  <>
                    <div className="qr-code-wrapper">
                      <img src={qrCodeUrl} alt="Restaurant Menu QR Code" style={{ width: '100%', maxWidth: '200px' }} />
                    </div>
                    <div className="flex flex-col gap-2 w-full" style={{ width: '100%' }}>
                      <a 
                        href={qrCodeUrl} 
                        download={`${menu.restaurantName.toLowerCase().replace(/\s+/g, '-')}-qr.png`}
                        className="btn btn-primary w-full"
                        style={{ width: '100%' }}
                      >
                        💾 Download QR Code
                      </a>
                      <button 
                        onClick={handleCopyLink} 
                        className="btn btn-secondary w-full"
                        style={{ width: '100%' }}
                      >
                        🔗 Copy Customer Link
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '40px 0' }}>Generating QR Code...</div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="footer">
        <p>MenuQR Creator Dashboard — Empowering local restaurants with contact-free menus.</p>
      </footer>

      {/* Modal: Add/Edit Section */}
      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{editingSectionId ? 'Rename Section' : 'Create New Section'}</h3>
            <form onSubmit={handleSaveSection}>
              <div className="form-group">
                <label className="form-label" htmlFor="section-name-input">Section Name</label>
                <input 
                  id="section-name-input"
                  type="text" 
                  className="form-input" 
                  value={sectionFormName} 
                  onChange={(e) => setSectionFormName(e.target.value)}
                  placeholder="e.g. Starters, Main Course, Drinks"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-between" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSectionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Item */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{itemForm.id ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label className="form-label" htmlFor="item-name-input">Item Name</label>
                <input 
                  id="item-name-input"
                  type="text" 
                  className="form-input" 
                  value={itemForm.name} 
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Garlic Truffle Fries"
                  required
                  autoFocus
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="item-price-input">Price ($)</label>
                  <input 
                    id="item-price-input"
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="form-input" 
                    value={itemForm.price} 
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="8.50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="item-diet-select">Diet Type</label>
                  <select 
                    id="item-diet-select"
                    className="form-input"
                    value={itemForm.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setItemForm(prev => ({ ...prev, isVeg: e.target.value === 'veg' }))}
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="item-desc-textarea">Description</label>
                <textarea 
                  id="item-desc-textarea"
                  className="form-input" 
                  rows="3"
                  value={itemForm.description} 
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the dish ingredients, allergens, preparation, etc."
                />
              </div>

              <div className="flex justify-between" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
