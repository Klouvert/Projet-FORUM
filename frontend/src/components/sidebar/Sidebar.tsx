import { useState } from 'react';
import type { Branch, IdeaNode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import SearchPanel from './SearchPanel';

interface SidebarProps {
  branches: Branch[];
  ideas: IdeaNode[];
  onCreateBranch: (name: string, description?: string) => Promise<void>;
}

type Tab = 'branches' | 'recherche' | 'racines';

const Sidebar = ({ branches, ideas, onCreateBranch }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('branches');
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchDesc, setBranchDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateBranch = async () => {
    if (!branchName.trim()) return;
    setSaving(true);
    try {
      await onCreateBranch(branchName.trim(), branchDesc.trim() || undefined);
      setBranchName('');
      setBranchDesc('');
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

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

      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #0f3460',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '13px', color: '#aaa' }}>
          🌳 <strong style={{ color: '#e0e0e0' }}>{user?.displayName}</strong>
        </span>
        <button onClick={logout} style={{
          background: 'none',
          border: '1px solid #0f3460',
          borderRadius: '4px',
          color: '#888',
          fontSize: '11px',
          padding: '3px 8px',
          cursor: 'pointer',
        }}>
          Déconnexion
        </button>
      </div>

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

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

        {activeTab === 'branches' && (
          <>
            <ul style={{ listStyle: 'none', marginBottom: '10px' }}>
              {branches.map((branch) => (
                <li key={branch.id} style={{
                  padding: '10px 12px',
                  marginBottom: '6px',
                  background: '#1a1a2e',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{branch.name}</span>
                  <span style={{
                    fontSize: '11px',
                    color: '#888',
                    background: '#0f3460',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}>
                    {branch.ideaCount} idées
                  </span>
                </li>
              ))}
              {branches.length === 0 && (
                <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                  Aucune branche disponible
                </p>
              )}
            </ul>

            {showForm ? (
              <div style={{
                background: '#1a1a2e',
                border: '1px solid #0f3460',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <input
                  type="text"
                  placeholder="Nom de la branche *"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optionnelle)"
                  value={branchDesc}
                  onChange={(e) => setBranchDesc(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCreateBranch}
                    disabled={saving || !branchName.trim()}
                    style={{ ...actionBtnStyle, background: '#0f3460', flex: 1 }}
                  >
                    {saving ? '...' : 'Créer'}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setBranchName(''); setBranchDesc(''); }}
                    style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid #0f3460', color: '#888' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowForm(true)} style={newBranchBtnStyle}>
                + Nouvelle branche
              </button>
            )}
          </>
        )}

        {activeTab === 'recherche' && <SearchPanel ideas={ideas} />}

        {activeTab === 'racines' && (
          <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
            Les racines seront chargées ici
          </p>
        )}
      </div>
    </aside>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: '#16213e',
  border: '1px solid #0f3460',
  borderRadius: '6px',
  color: '#e0e0e0',
  fontSize: '13px',
  width: '100%',
};

const actionBtnStyle: React.CSSProperties = {
  padding: '7px 12px',
  border: 'none',
  borderRadius: '6px',
  color: '#e0e0e0',
  fontSize: '13px',
  cursor: 'pointer',
};

const newBranchBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px',
  background: 'transparent',
  border: '1px dashed #0f3460',
  borderRadius: '8px',
  color: '#888',
  fontSize: '13px',
  cursor: 'pointer',
};

export default Sidebar;
