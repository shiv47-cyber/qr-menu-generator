import React, { useState, useMemo } from 'react';

export default function CustomerMenu({ menuData, onBackToDashboard }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const themeClass = menuData.theme ? `theme-${menuData.theme}` : 'theme-emerald';

  // Flat list of all items for search
  const allItems = useMemo(() => {
    const items = [];
    menuData.sections.forEach(section => {
      section.items.forEach(item => {
        items.push({
          ...item,
          sectionName: section.name,
          sectionId: section.id
        });
      });
    });
    return items;
  }, [menuData]);

  // Filter items based on active tab and search query
  const filteredSections = useMemo(() => {
    return menuData.sections.map(section => {
      // Filter items within this section
      const items = section.items.filter(item => {
        const matchesSearch = 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSection = activeSectionId === 'all' || activeSectionId === section.id;
        
        return matchesSearch && matchesSection;
      });

      return {
        ...section,
        items
      };
    }).filter(section => section.items.length > 0); // Only keep sections with matching items
  }, [menuData, searchQuery, activeSectionId]);

  return (
    <div className={`customer-view-wrapper ${themeClass}`}>
      <div className="customer-container">
        
        {/* Banner/Header */}
        <header className="customer-banner">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              ← Dashboard
            </button>
          )}
          <h1>{menuData.restaurantName || "Our Restaurant"}</h1>
          <p>Fresh ingredients, prepared with passion</p>
        </header>

        {/* Search */}
        <section className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search dishes or beverages..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Sticky Category Tabs */}
        <nav className="tabs-container">
          <button 
            onClick={() => setActiveSectionId('all')}
            className={`tab-btn ${activeSectionId === 'all' ? 'active' : ''}`}
          >
            All Items
          </button>
          {menuData.sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`tab-btn ${activeSectionId === section.id ? 'active' : ''}`}
            >
              {section.name}
            </button>
          ))}
        </nav>

        {/* Menu Sections and Items */}
        <main style={{ flex: 1, paddingBottom: '40px' }}>
          {filteredSections.length > 0 ? (
            filteredSections.map(section => (
              <section key={section.id} className="menu-section">
                <h3 className="section-heading">
                  <span>{section.name}</span>
                  <span className="section-item-count">{section.items.length} items</span>
                </h3>

                <div className="menu-items-list">
                  {section.items.map(item => (
                    <div 
                      key={item.id} 
                      className="menu-item-card"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="item-details">
                        <div className="item-name">
                          {item.name}
                          <span className={`badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                            <span className="veg-dot"></span>
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <p className="item-desc">{item.description}</p>
                        <div className="item-price">${parseFloat(item.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state" style={{ margin: '40px 16px' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🥗 No dishes found</p>
              <p style={{ fontSize: '0.85rem' }}>Try searching something else or selecting another category.</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
          <p>© {new Date().getFullYear()} {menuData.restaurantName}. Powered by QR Menu Generator.</p>
        </footer>

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--bg-surface-hover)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)'
                }}
              >
                ✕
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <span className={`badge ${selectedItem.isVeg ? 'badge-veg' : 'badge-nonveg'}`} style={{ alignSelf: 'flex-start' }}>
                  <span className="veg-dot"></span>
                  {selectedItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </span>
                
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedItem.name}</h2>
                
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${parseFloat(selectedItem.price).toFixed(2)}
                </div>
                
                <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '8px 0' }} />
                
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Description
                  </h4>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {selectedItem.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
