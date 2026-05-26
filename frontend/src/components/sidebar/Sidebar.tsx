import { useState } from 'react';
import { LogOut, GitBranch, Search, Leaf, Shield } from 'lucide-react';
import type { Branch, IdeaNode, TrunkValue } from '../../types';
import { useAuth } from '../../context/AuthContext';
import SearchPanel from './SearchPanel';

interface SidebarProps {
  branches: Branch[];
  ideas: IdeaNode[];
  trunkValues: TrunkValue[];
  onCreateBranch: (name: string, description?: string) => Promise<void>;
  onCreateTrunkValue: (name: string, description: string) => Promise<void>;
  onDeleteTrunkValue: (id: string) => Promise<void>;
}

type Tab = 'branches' | 'recherche' | 'racines';

const Sidebar = ({ branches, ideas, trunkValues, onCreateBranch, onCreateTrunkValue, onDeleteTrunkValue }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('branches');
  const { user, logout } = useAuth();
  const isAdmin = user?.isAdmin ?? false;

  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchDesc, setBranchDesc] = useState('');
  const [branchSaving, setBranchSaving] = useState(false);

  const [showValueForm, setShowValueForm] = useState(false);
  const [valueName, setValueName] = useState('');
  const [valueDesc, setValueDesc] = useState('');
  const [valueSaving, setValueSaving] = useState(false);

  const handleCreateBranch = async () => {
    if (!branchName.trim()) return;
    setBranchSaving(true);
    try {
      await onCreateBranch(branchName.trim(), branchDesc.trim() || undefined);
      setBranchName(''); setBranchDesc(''); setShowBranchForm(false);
    } finally {
      setBranchSaving(false);
    }
  };

  const handleCreateValue = async () => {
    if (!valueName.trim() || !valueDesc.trim()) return;
    setValueSaving(true);
    try {
      await onCreateTrunkValue(valueName.trim(), valueDesc.trim());
      setValueName(''); setValueDesc(''); setShowValueForm(false);
    } finally {
      setValueSaving(false);
    }
  };

  return (
    <aside style={{
      width: '280px', height: '100vh', background: '#16213e',
      borderRight: '1px solid #0f3460', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #0f3460',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '13px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🌳 <strong style={{ color: '#e0e0e0' }}>{user?.displayName}</strong>
          {isAdmin && (
            <span style={{
              fontSize: '9px', background: '#7e57c2', color: '#fff',
              borderRadius: '4px', padding: '1px 5px', letterSpacing: '0.4px',
            }}>ADMIN</span>
          )}
        </span>
        <button onClick={logout} title="Déconnexion" style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)', padding: '4px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          <LogOut size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {([
          { id: 'branches',  Icon: GitBranch, label: 'Branches' },
          { id: 'recherche', Icon: Search,    label: 'Recherche' },
          { id: 'racines',   Icon: isAdmin ? Shield : Leaf, label: 'Racines' },
        ] as { id: Tab; Icon: React.FC<{ size: number }>; label: string }[]).map(({ id, Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} title={label} style={{
            flex: 1, padding: '11px 4px',
            background: activeTab === id ? 'var(--border)' : 'transparent',
            color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
            border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '3px', fontSize: '10px', transition: 'color 0.15s',
          }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

        {/* ── Branches ─────────────────────────────────────── */}
        {activeTab === 'branches' && (
          <>
            <ul style={{ listStyle: 'none', marginBottom: '10px' }}>
              {branches.map((branch) => (
                <li key={branch.id} style={{
                  padding: '10px 12px', marginBottom: '6px', background: '#1a1a2e',
                  borderRadius: '8px', fontSize: '14px', color: '#e0e0e0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{branch.name}</span>
                  <span style={{
                    fontSize: '11px', color: '#888', background: '#0f3460',
                    padding: '2px 8px', borderRadius: '12px',
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

            {isAdmin && (
              showBranchForm ? (
                <div style={formBoxStyle}>
                  <input type="text" placeholder="Nom de la branche *" value={branchName}
                    onChange={(e) => setBranchName(e.target.value)} style={inputStyle} autoFocus />
                  <input type="text" placeholder="Description (optionnelle)" value={branchDesc}
                    onChange={(e) => setBranchDesc(e.target.value)} style={inputStyle} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCreateBranch} disabled={branchSaving || !branchName.trim()}
                      style={{ ...actionBtnStyle, background: '#0f3460', flex: 1 }}>
                      {branchSaving ? '...' : 'Créer'}
                    </button>
                    <button onClick={() => { setShowBranchForm(false); setBranchName(''); setBranchDesc(''); }}
                      style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid #0f3460', color: '#888' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowBranchForm(true)} style={dashedBtnStyle}>
                  + Nouvelle branche
                </button>
              )
            )}
          </>
        )}

        {/* ── Recherche ─────────────────────────────────────── */}
        {activeTab === 'recherche' && <SearchPanel ideas={ideas} />}

        {/* ── Racines (valeurs du tronc) ─────────────────────── */}
        {activeTab === 'racines' && (
          <>
            <ul style={{ listStyle: 'none', marginBottom: '10px' }}>
              {trunkValues.map((tv) => (
                <li key={tv.id} style={{
                  padding: '10px 12px', marginBottom: '6px', background: '#1a1a2e',
                  borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e0e0e0', fontWeight: 500 }}>{tv.name}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '3px', lineHeight: 1.4 }}>
                      {tv.description}
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => onDeleteTrunkValue(tv.id)} title="Supprimer" style={{
                      background: 'none', border: 'none', color: '#555', cursor: 'pointer',
                      fontSize: '16px', padding: '0 0 0 8px', flexShrink: 0,
                    }}>
                      ×
                    </button>
                  )}
                </li>
              ))}
              {trunkValues.length === 0 && (
                <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                  Aucune valeur fondatrice
                </p>
              )}
            </ul>

            {isAdmin && (
              showValueForm ? (
                <div style={formBoxStyle}>
                  <input type="text" placeholder="Nom de la valeur *" value={valueName}
                    onChange={(e) => setValueName(e.target.value)} style={inputStyle} autoFocus />
                  <textarea placeholder="Description *" value={valueDesc}
                    onChange={(e) => setValueDesc(e.target.value)} rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCreateValue} disabled={valueSaving || !valueName.trim() || !valueDesc.trim()}
                      style={{ ...actionBtnStyle, background: '#4CAF50', flex: 1 }}>
                      {valueSaving ? '...' : 'Ajouter'}
                    </button>
                    <button onClick={() => { setShowValueForm(false); setValueName(''); setValueDesc(''); }}
                      style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid #0f3460', color: '#888' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowValueForm(true)} style={dashedBtnStyle}>
                  + Nouvelle valeur fondatrice
                </button>
              )
            )}
          </>
        )}
      </div>
    </aside>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px', background: '#16213e', border: '1px solid #0f3460',
  borderRadius: '6px', color: '#e0e0e0', fontSize: '13px', width: '100%', boxSizing: 'border-box',
};
const formBoxStyle: React.CSSProperties = {
  background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '8px',
  padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
};
const actionBtnStyle: React.CSSProperties = {
  padding: '7px 12px', border: 'none', borderRadius: '6px', color: '#e0e0e0', fontSize: '13px', cursor: 'pointer',
};
const dashedBtnStyle: React.CSSProperties = {
  width: '100%', padding: '9px', background: 'transparent', border: '1px dashed #0f3460',
  borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer',
};

export default Sidebar;
