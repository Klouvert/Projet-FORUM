import { useState } from 'react';
import type { Branch, Domain } from '../../types';

const DOMAINS: { value: Domain; label: string }[] = [
  { value: 'ecology', label: '🌿 Écologie' },
  { value: 'social', label: '🤝 Social' },
  { value: 'economy', label: '💶 Économie' },
  { value: 'culture', label: '🎭 Culture' },
];

interface CreateIdeaModalProps {
  branches: Branch[];
  onClose: () => void;
  onSubmit: (title: string, content: string, domain: Domain, branchId?: string) => Promise<void>;
}

const CreateIdeaModal = ({ branches, onClose, onSubmit }: CreateIdeaModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [domain, setDomain] = useState<Domain>('social');
  const [branchId, setBranchId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(title.trim(), content.trim(), domain, branchId || undefined);
      onClose();
    } catch {
      setError("Erreur lors de la création de l'idée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <div>
            <span style={{ ...badgeStyle, background: '#9C27B0' }}>🌱 Nouvelle idée</span>
            <h2 style={{ fontSize: '18px', marginTop: '8px' }}>Proposer une idée</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(229,57,53,0.15)', border: '1px solid #e53935', borderRadius: '6px',
            padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#e57373',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Résumez votre idée en une phrase" required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Description *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre idée en détail..." required rows={5}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Domaine *</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value as Domain)} style={inputStyle}>
                {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Branche (optionnel)</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} style={inputStyle}>
                <option value="">— Aucune branche —</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Annuler</button>
            <button type="submit" disabled={loading || !title.trim() || !content.trim()} style={submitBtnStyle}>
              {loading ? 'Publication...' : "🌱 Publier l'idée"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: '#16213e', borderRadius: '12px', padding: '24px', width: '520px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', color: '#e0e0e0', border: '1px solid #0f3460' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' };
const badgeStyle: React.CSSProperties = { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', color: '#fff' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties = { padding: '9px 20px', background: 'transparent', border: '1px solid #0f3460', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '13px' };
const submitBtnStyle: React.CSSProperties = { padding: '9px 20px', background: '#9C27B0', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px' };

export default CreateIdeaModal;
