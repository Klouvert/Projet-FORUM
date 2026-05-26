import { useState } from 'react';
import { LogOut, GitBranch, Search, Leaf, Shield, Pencil, Trash2 } from 'lucide-react';
import type { Branch, IdeaNode, TrunkValue } from '../../types';
import { useAuth } from '../../context/AuthContext';
import SearchPanel from './SearchPanel';
import AdminUsersPanel from './AdminUsersPanel';

interface SidebarProps {
  branches: Branch[];
  ideas: IdeaNode[];
  trunkValues: TrunkValue[];
  onSelectIdea: (idea: IdeaNode) => void;
  onCreateBranch: (name: string, description?: string) => Promise<void>;
  onUpdateBranch: (id: string, name: string, description?: string) => Promise<void>;
  onDeleteBranch: (id: string) => Promise<void>;
  onCreateTrunkValue: (name: string, description: string) => Promise<void>;
  onUpdateTrunkValue: (id: string, name: string, description: string) => Promise<void>;
  onDeleteTrunkValue: (id: string) => Promise<void>;
}

type Tab = 'branches' | 'recherche' | 'racines';

const Sidebar = ({
  branches, ideas, trunkValues, onSelectIdea,
  onCreateBranch, onUpdateBranch, onDeleteBranch,
  onCreateTrunkValue, onUpdateTrunkValue, onDeleteTrunkValue,
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('branches');
  const { user, logout } = useAuth();
  const isAdmin = user?.isAdmin ?? false;

  /* ── Branch form ────────────────────────────────────────────── */
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchDesc, setBranchDesc] = useState('');
  const [branchSaving, setBranchSaving] = useState(false);

  /* ── Branch edit ────────────────────────────────────────────── */
  const [editBranchId, setEditBranchId] = useState<string | null>(null);
  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchDesc, setEditBranchDesc] = useState('');
  const [editBranchSaving, setEditBranchSaving] = useState(false);

  /* ── Trunk value form ───────────────────────────────────────── */
  const [showValueForm, setShowValueForm] = useState(false);
  const [valueName, setValueName] = useState('');
  const [valueDesc, setValueDesc] = useState('');
  const [valueSaving, setValueSaving] = useState(false);

  /* ── Trunk value edit ───────────────────────────────────────── */
  const [editValueId, setEditValueId] = useState<string | null>(null);
  const [editValueName, setEditValueName] = useState('');
  const [editValueDesc, setEditValueDesc] = useState('');
  const [editValueSaving, setEditValueSaving] = useState(false);

  const handleCreateBranch = async () => {
    if (!branchName.trim()) return;
    setBranchSaving(true);
    try {
      await onCreateBranch(branchName.trim(), branchDesc.trim() || undefined);
      setBranchName(''); setBranchDesc(''); setShowBranchForm(false);
    } finally { setBranchSaving(false); }
  };

  const startEditBranch = (b: Branch) => {
    setEditBranchId(b.id);
    setEditBranchName(b.name);
    setEditBranchDesc(b.description ?? '');
  };

  const handleUpdateBranch = async () => {
    if (!editBranchId || !editBranchName.trim()) return;
    setEditBranchSaving(true);
    try {
      await onUpdateBranch(editBranchId, editBranchName.trim(), editBranchDesc.trim() || undefined);
      setEditBranchId(null);
    } finally { setEditBranchSaving(false); }
  };

  const handleCreateValue = async () => {
    if (!valueName.trim() || !valueDesc.trim()) return;
    setValueSaving(true);
    try {
      await onCreateTrunkValue(valueName.trim(), valueDesc.trim());
      setValueName(''); setValueDesc(''); setShowValueForm(false);
    } finally { setValueSaving(false); }
  };

  const startEditValue = (tv: TrunkValue) => {
    setEditValueId(tv.id);
    setEditValueName(tv.name);
    setEditValueDesc(tv.description);
  };

  const handleUpdateValue = async () => {
    if (!editValueId || !editValueName.trim() || !editValueDesc.trim()) return;
    setEditValueSaving(true);
    try {
      await onUpdateTrunkValue(editValueId, editValueName.trim(), editValueDesc.trim());
      setEditValueId(null);
    } finally { setEditValueSaving(false); }
  };

  return (
    <aside style={{
      width: '280px', height: '100vh', background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🌳 <strong style={{ color: 'var(--text-primary)' }}>{user?.displayName}</strong>
          {isAdmin && (
            <span style={{ fontSize: '9px', background: '#7e57c2', color: '#fff', borderRadius: '4px', padding: '1px 5px', letterSpacing: '0.4px' }}>ADMIN</span>
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
                <li key={branch.id} style={{ marginBottom: '6px' }}>
                  {editBranchId === branch.id ? (
                    <div style={formBoxStyle}>
                      <input type="text" value={editBranchName}
                        onChange={(e) => setEditBranchName(e.target.value)} style={inputStyle} autoFocus />
                      <input type="text" value={editBranchDesc} placeholder="Description (optionnelle)"
                        onChange={(e) => setEditBranchDesc(e.target.value)} style={inputStyle} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleUpdateBranch} disabled={editBranchSaving || !editBranchName.trim()}
                          style={{ ...actionBtnStyle, background: 'var(--accent)', flex: 1 }}>
                          {editBranchSaving ? '...' : 'Enregistrer'}
                        </button>
                        <button onClick={() => setEditBranchId(null)}
                          style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '8px',
                      fontSize: '14px', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: '1px solid var(--border)',
                    }}>
                      <span>{branch.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '12px' }}>
                          {branch.ideaCount} idées
                        </span>
                        {isAdmin && (
                          <>
                            <button onClick={() => startEditBranch(branch)} title="Modifier" style={editBtnStyle}><Pencil size={13} /></button>
                            <button onClick={() => onDeleteBranch(branch.id)} title="Supprimer" style={deleteBtnStyle}><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {branches.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>Aucune branche</p>
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
                      style={{ ...actionBtnStyle, background: 'var(--accent)', flex: 1 }}>
                      {branchSaving ? '...' : 'Créer'}
                    </button>
                    <button onClick={() => { setShowBranchForm(false); setBranchName(''); setBranchDesc(''); }}
                      style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowBranchForm(true)} style={dashedBtnStyle}>+ Nouvelle branche</button>
              )
            )}
          </>
        )}

        {/* ── Recherche ─────────────────────────────────────── */}
        {activeTab === 'recherche' && <SearchPanel ideas={ideas} onSelectIdea={onSelectIdea} />}

        {/* ── Racines ───────────────────────────────────────── */}
        {activeTab === 'racines' && (
          <>
            <ul style={{ listStyle: 'none', marginBottom: '10px' }}>
              {trunkValues.map((tv) => (
                <li key={tv.id} style={{ marginBottom: '6px' }}>
                  {editValueId === tv.id ? (
                    <div style={formBoxStyle}>
                      <input type="text" value={editValueName}
                        onChange={(e) => setEditValueName(e.target.value)} style={inputStyle} autoFocus />
                      <textarea value={editValueDesc} rows={3}
                        onChange={(e) => setEditValueDesc(e.target.value)}
                        style={{ ...inputStyle, resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleUpdateValue} disabled={editValueSaving || !editValueName.trim() || !editValueDesc.trim()}
                          style={{ ...actionBtnStyle, background: '#4CAF50', flex: 1 }}>
                          {editValueSaving ? '...' : 'Enregistrer'}
                        </button>
                        <button onClick={() => setEditValueId(null)}
                          style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '8px',
                      border: '1px solid var(--border)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{tv.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>{tv.description}</div>
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, paddingLeft: '8px' }}>
                          <button onClick={() => startEditValue(tv)} title="Modifier" style={editBtnStyle}><Pencil size={13} /></button>
                          <button onClick={() => onDeleteTrunkValue(tv.id)} title="Supprimer" style={deleteBtnStyle}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
              {trunkValues.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>Aucune valeur fondatrice</p>
              )}
            </ul>

            {isAdmin && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
                <AdminUsersPanel />
              </div>
            )}

            {isAdmin && (
              showValueForm ? (
                <div style={formBoxStyle}>
                  <input type="text" placeholder="Nom de la valeur *" value={valueName}
                    onChange={(e) => setValueName(e.target.value)} style={inputStyle} autoFocus />
                  <textarea placeholder="Description *" value={valueDesc} rows={3}
                    onChange={(e) => setValueDesc(e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCreateValue} disabled={valueSaving || !valueName.trim() || !valueDesc.trim()}
                      style={{ ...actionBtnStyle, background: '#4CAF50', flex: 1 }}>
                      {valueSaving ? '...' : 'Ajouter'}
                    </button>
                    <button onClick={() => { setShowValueForm(false); setValueName(''); setValueDesc(''); }}
                      style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowValueForm(true)} style={dashedBtnStyle}>+ Nouvelle valeur fondatrice</button>
              )
            )}
          </>
        )}
      </div>
    </aside>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', width: '100%', boxSizing: 'border-box',
};
const formBoxStyle: React.CSSProperties = {
  background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
};
const actionBtnStyle: React.CSSProperties = {
  padding: '7px 12px', border: 'none', borderRadius: '6px', color: '#ffffff', fontSize: '13px', cursor: 'pointer',
};
const dashedBtnStyle: React.CSSProperties = {
  width: '100%', padding: '9px', background: 'transparent', border: '1px dashed var(--border)',
  borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
};
const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '2px 4px',
  display: 'flex', alignItems: 'center',
};
const editBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '6px',
  color: 'var(--text-secondary)', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const deleteBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', background: 'rgba(229,57,53,0.12)', border: '1px solid #e53935', borderRadius: '6px',
  color: '#e57373', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

export default Sidebar;
