import { useState } from 'react';
import { LogOut, GitBranch, Search, Leaf, Shield, Pencil, Trash2, Settings, Users, X, Plus } from 'lucide-react';
import type { Branch, IdeaNode, TrunkValue } from '../../types';
import { useAuth } from '../../context/AuthContext';
import SearchPanel from './SearchPanel';
import AdminUsersPanel from './AdminUsersPanel';

interface SidebarProps {
  branches: Branch[];
  ideas: IdeaNode[];
  trunkValues: TrunkValue[];
  onSelectIdea: (idea: IdeaNode) => void;
  onCreateBranch: (name: string, description?: string, parentBranchId?: string) => Promise<void>;
  onUpdateBranch: (id: string, name: string, description?: string) => Promise<void>;
  onDeleteBranch: (id: string) => Promise<void>;
  onCreateTrunkValue: (name: string, description: string) => Promise<void>;
  onUpdateTrunkValue: (id: string, name: string, description: string) => Promise<void>;
  onDeleteTrunkValue: (id: string) => Promise<void>;
}

type Tab = 'branches' | 'recherche' | 'racines';
type SettingsSection = 'users';

const SETTINGS_NAV: { id: SettingsSection; Icon: React.FC<{ size: number }>; label: string }[] = [
  { id: 'users', Icon: Users, label: 'Utilisateurs' },
];


const Sidebar = ({
  branches, ideas, trunkValues, onSelectIdea,
  onCreateBranch, onUpdateBranch, onDeleteBranch,
  onCreateTrunkValue, onUpdateTrunkValue, onDeleteTrunkValue,
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('branches');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('users');
  const { user, logout } = useAuth();
  const isAdmin = user?.isAdmin ?? false;

  /* ── Root branch form ───────────────────────────────────────── */
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchDesc, setBranchDesc] = useState('');
  const [branchSaving, setBranchSaving] = useState(false);

  /* ── Sub-branch form ────────────────────────────────────────── */
  const [subBranchParentId, setSubBranchParentId] = useState<string | null>(null);
  const [subBranchName, setSubBranchName] = useState('');
  const [subBranchDesc, setSubBranchDesc] = useState('');
  const [subBranchSaving, setSubBranchSaving] = useState(false);

  /* ── Branch edit ────────────────────────────────────────────── */
  const [editBranchId, setEditBranchId] = useState<string | null>(null);
  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchDesc, setEditBranchDesc] = useState('');
  const [editBranchSaving, setEditBranchSaving] = useState(false);
  const [deleteBranchError, setDeleteBranchError] = useState<string | null>(null);

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

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleCreateRootBranch = async () => {
    if (!branchName.trim()) return;
    setBranchSaving(true);
    try {
      await onCreateBranch(branchName.trim(), branchDesc.trim() || undefined);
      setBranchName(''); setBranchDesc(''); setShowBranchForm(false);
    } finally { setBranchSaving(false); }
  };

  const handleCreateSubBranch = async () => {
    if (!subBranchName.trim() || !subBranchParentId) return;
    setSubBranchSaving(true);
    try {
      await onCreateBranch(subBranchName.trim(), subBranchDesc.trim() || undefined, subBranchParentId);
      setSubBranchName(''); setSubBranchDesc(''); setSubBranchParentId(null);
    } finally { setSubBranchSaving(false); }
  };

  const startEditBranch = (b: Branch) => {
    setEditBranchId(b.id);
    setEditBranchName(b.name);
    setEditBranchDesc(b.description ?? '');
    setDeleteBranchError(null);
  };

  const handleUpdateBranch = async () => {
    if (!editBranchId || !editBranchName.trim()) return;
    setEditBranchSaving(true);
    try {
      await onUpdateBranch(editBranchId, editBranchName.trim(), editBranchDesc.trim() || undefined);
      setEditBranchId(null);
    } finally { setEditBranchSaving(false); }
  };

  const handleDeleteBranch = async (id: string) => {
    setDeleteBranchError(null);
    try {
      await onDeleteBranch(id);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e?.response?.status === 409) {
        setDeleteBranchError(e.response.data?.error ?? 'Supprimez d\'abord les sous-branches.');
      } else {
        setDeleteBranchError('Erreur lors de la suppression.');
      }
    }
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

  /* ── Recursive branch renderer ──────────────────────────────── */

  const renderBranchTree = (parentId: string | null, depth: number): React.ReactNode => {
    const items = branches.filter(b => b.parentBranchId === parentId);
    if (items.length === 0 && parentId !== null) return null;

    return items.map((branch) => {
      const children = branches.filter(b => b.parentBranchId === branch.id);
      const hasChildren = children.length > 0;
      const canAddSub = isAdmin && depth < 2; // depth 0 = root, 1 = child, 2 = grandchild → max 3 levels

      return (
        <li key={branch.id} style={{ marginBottom: '4px' }}>
          {editBranchId === branch.id ? (
            <div style={{ ...formBoxStyle, marginLeft: depth * 16 }}>
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
            <div style={{ marginLeft: depth * 16 }}>
              <div style={{
                padding: '8px 10px', background: 'var(--bg-card)', borderRadius: '8px',
                fontSize: depth === 0 ? '14px' : '13px',
                color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: '1px solid var(--border)',
                borderLeft: depth > 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  {depth > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', flexShrink: 0 }}>└</span>
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {branch.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--border)', padding: '1px 6px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                    {branch.ideaCount}
                    {hasChildren && ` +${children.reduce((acc, c) => acc + c.ideaCount, 0)}`}
                  </span>
                  {isAdmin && (
                    <>
                      {canAddSub && (
                        <button
                          onClick={() => { setSubBranchParentId(branch.id); setSubBranchName(''); setSubBranchDesc(''); }}
                          title="Ajouter une sous-branche"
                          style={addSubBtnStyle}
                        >
                          <Plus size={11} />
                        </button>
                      )}
                      <button onClick={() => startEditBranch(branch)} title="Modifier" style={editBtnStyle}><Pencil size={13} /></button>
                      <button onClick={() => handleDeleteBranch(branch.id)} title="Supprimer" style={deleteBtnStyle}><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>

              {/* Sub-branch creation form */}
              {subBranchParentId === branch.id && (
                <div style={{ ...formBoxStyle, marginTop: '4px', marginLeft: 16 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Sous-branche de <strong>{branch.name}</strong>
                  </div>
                  <input type="text" placeholder="Nom de la sous-branche *" value={subBranchName}
                    onChange={(e) => setSubBranchName(e.target.value)} style={inputStyle} autoFocus />
                  <input type="text" placeholder="Description (optionnelle)" value={subBranchDesc}
                    onChange={(e) => setSubBranchDesc(e.target.value)} style={inputStyle} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCreateSubBranch} disabled={subBranchSaving || !subBranchName.trim()}
                      style={{ ...actionBtnStyle, background: 'var(--accent)', flex: 1 }}>
                      {subBranchSaving ? '...' : 'Créer'}
                    </button>
                    <button onClick={() => setSubBranchParentId(null)}
                      style={{ ...actionBtnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recurse into children */}
          {children.length > 0 && (
            <ul style={{ listStyle: 'none', marginTop: '3px' }}>
              {renderBranchTree(branch.id, depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <aside style={{
        width: '280px', height: '100vh', background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative', zIndex: 10,
      }}>

        {/* ── Header ──────────────────────────────────────────── */}
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
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {isAdmin && (
              <button
                onClick={() => setSettingsOpen(o => !o)}
                title="Paramètres"
                style={{
                  ...headerBtnStyle,
                  background: settingsOpen ? 'var(--border)' : 'none',
                  color: settingsOpen ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <Settings size={13} />
              </button>
            )}
            <button onClick={logout} title="Déconnexion" style={headerBtnStyle}>
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
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

        {/* ── Tab content ─────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

          {/* ── Branches ──────────────────────────────────────── */}
          {activeTab === 'branches' && (
            <>
              {deleteBranchError && (
                <div style={{
                  marginBottom: '8px', padding: '8px 10px',
                  background: 'rgba(229,57,53,0.1)', border: '1px solid #e53935',
                  borderRadius: '6px', fontSize: '12px', color: '#e57373',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px',
                }}>
                  <span>{deleteBranchError}</span>
                  <button onClick={() => setDeleteBranchError(null)}
                    style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', flexShrink: 0, padding: '0' }}>
                    <X size={12} />
                  </button>
                </div>
              )}

              <ul style={{ listStyle: 'none', marginBottom: '10px' }}>
                {renderBranchTree(null, 0)}
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
                      <button onClick={handleCreateRootBranch} disabled={branchSaving || !branchName.trim()}
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
                  <button onClick={() => setShowBranchForm(true)} style={dashedBtnStyle}>+ Nouvelle branche racine</button>
                )
              )}
            </>
          )}

          {/* ── Recherche ─────────────────────────────────────── */}
          {activeTab === 'recherche' && <SearchPanel ideas={ideas} branches={branches} onSelectIdea={onSelectIdea} />}

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

      {/* ── Panneau Paramètres (overlay à droite du sidebar) ──── */}
      {settingsOpen && isAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: '280px', height: '100vh', width: '460px',
          background: 'var(--bg-panel)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', zIndex: 20,
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14} /> Paramètres
            </span>
            <button onClick={() => setSettingsOpen(false)} style={headerBtnStyle} title="Fermer">
              <X size={14} />
            </button>
          </div>

          {/* Corps : nav gauche + contenu droite */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* Nav catégories */}
            <nav style={{
              width: '120px', borderRight: '1px solid var(--border)',
              padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px',
              flexShrink: 0,
            }}>
              {SETTINGS_NAV.map(({ id, Icon, label }) => (
                <button key={id} onClick={() => setSettingsSection(id)} style={{
                  width: '100%', padding: '10px 8px',
                  background: settingsSection === id ? 'var(--border)' : 'transparent',
                  color: settingsSection === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  fontSize: '10px', transition: 'color 0.15s',
                }}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Contenu de la section */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {settingsSection === 'users' && <AdminUsersPanel />}
            </div>
          </div>
        </div>
      )}
    </>
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
const headerBtnStyle: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  color: 'var(--text-muted)', padding: '4px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center',
};
const editBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '6px',
  color: 'var(--text-secondary)', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const deleteBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', background: 'rgba(229,57,53,0.12)', border: '1px solid #e53935', borderRadius: '6px',
  color: '#e57373', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const addSubBtnStyle: React.CSSProperties = {
  width: '22px', height: '22px', background: 'rgba(var(--accent-rgb, 126,87,194),0.12)', border: '1px solid var(--accent)',
  borderRadius: '5px', color: 'var(--accent)', cursor: 'pointer', padding: '0',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

export default Sidebar;
