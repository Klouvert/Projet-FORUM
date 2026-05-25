import { useState } from 'react';
import type { Branche } from '../../types';
import SearchPanel from './SearchPanel';

interface SidebarProps {
  branches: Branche[];
}

type Tab = 'branches' | 'recherche' | 'racines';

const Sidebar = ({ branches }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('branches');

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      background: '#16213e',
      borderRight: '1px solid #0f3460',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #0f3460' }}>
        {(['branches', 'recherche', 'racines'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 4px',
              background: activeTab === tab ? '#0f3460' : 'transparent',
              color: activeTab === tab ? '#e0e0e0' : '#888',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

        {activeTab === 'branches' && (
          <ul style={{ listStyle: 'none' }}>
            {branches.map((branche) => (
              <li key={branche.id} style={{
                padding: '10px 12px',
                marginBottom: '6px',
                background: '#1a1a2e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>{branche.name}</span>
                <span style={{
                  fontSize: '11px',
                  color: '#888',
                  background: '#0f3460',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}>
                  {branche.userCount} utilisateurs
                </span>
              </li>
            ))}
            {branches.length === 0 && (
              <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                Aucune branche disponible
              </p>
            )}
          </ul>
        )}

        {activeTab === 'recherche' && <SearchPanel />}

        {activeTab === 'racines' && (
          <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
            Les racines seront chargées ici
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;