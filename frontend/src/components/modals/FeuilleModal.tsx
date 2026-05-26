import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { IdeaDetail } from '../../types';
import ScoreChart from '../ui/ScoreChart';
import { useAuth } from '../../context/AuthContext';

interface FeuilleModalProps {
  idea: IdeaDetail;
  onClose: () => void;
  onDelete: (ideaId: string) => Promise<void>;
  onUpdateIdea: (ideaId: string, title: string, content: string) => Promise<void>;
}

const FeuilleModal = ({ idea: initialIdea, onClose, onDelete, onUpdateIdea }: FeuilleModalProps) => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin ?? false;

  const [idea, setIdea] = useState<IdeaDetail>(initialIdea);

  const [editingIdea, setEditingIdea] = useState(false);
  const [editTitle,   setEditTitle]   = useState(idea.title);
  const [editContent, setEditContent] = useState(idea.content);
  const [ideaSaving,  setIdeaSaving]  = useState(false);

  const handleSaveIdea = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setIdeaSaving(true);
    try {
      await onUpdateIdea(idea.id, editTitle.trim(), editContent.trim());
      setIdea(prev => ({ ...prev, title: editTitle.trim(), content: editContent.trim() }));
      setEditingIdea(false);
    } finally { setIdeaSaving(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="modal-animate" style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <div style={{ flex: 1 }}>
            <span style={{ ...badgeStyle, background: '#4CAF50' }}>🍃 Feuille</span>
            {editingIdea ? (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={editInputStyle} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveIdea} disabled={ideaSaving} style={saveBtnStyle}>
                    {ideaSaving ? '...' : 'Enregistrer'}
                  </button>
                  <button onClick={() => setEditingIdea(false)} style={cancelBtnStyle}>Annuler</button>
                </div>
              </div>
            ) : (
              <h2 style={{ fontSize: '18px', marginTop: '8px' }}>{idea.title}</h2>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && !editingIdea && (
              <button onClick={() => { setEditTitle(idea.title); setEditContent(idea.content); setEditingIdea(true); }} title="Modifier l'idée" style={editBtnStyle}><Pencil size={14} /></button>
            )}
            {isAdmin && (
              <button onClick={() => onDelete(idea.id)} title="Supprimer (admin)" style={deleteBtnStyle}><Trash2 size={14} /></button>
            )}
            <button onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>
        </div>

        <div style={{
          background: 'rgba(76,175,80,0.15)', border: '1px solid #4CAF50', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center',
          gap: '8px', fontSize: '13px', color: '#4CAF50',
        }}>
          ✓ Proposition validée et intégrée
        </div>

        {editingIdea ? (
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4}
            style={{ ...editInputStyle, resize: 'vertical', marginBottom: '16px' }} />
        ) : (
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{idea.content}</p>
        )}

        <ScoreChart averageScore={idea.averageScore} voteCount={idea.voteCount} />

        {idea.amendments.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Contenu final — Amendements intégrés</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {idea.amendments.map((amendment, i) => (
                <li key={amendment.id} style={{
                  padding: '12px 14px', background: '#1a1a2e', borderRadius: '8px',
                  borderLeft: '3px solid #4CAF50', fontSize: '13px', color: '#ddd',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#4CAF50', fontSize: '11px' }}>Amendement {i + 1}</span>
                    <span style={{ color: '#888', fontSize: '11px' }}>
                      {amendment.averageScore.toFixed(1)}/10 · {amendment.voteCount} votes
                    </span>
                  </div>
                  <p>{amendment.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {idea.arguments.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Arguments ayant conduit à la validation</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {idea.arguments.map((arg) => (
                <li key={arg.id} style={{
                  padding: '8px 12px',
                  background: arg.side === 'pour' ? 'rgba(76,175,80,0.08)' : 'rgba(229,57,53,0.08)',
                  borderLeft: `2px solid ${arg.side === 'pour' ? '#4CAF50' : '#e53935'}`,
                  borderRadius: '0 6px 6px 0', fontSize: '12px', color: '#bbb',
                }}>
                  <span style={{ color: arg.side === 'pour' ? '#4CAF50' : '#e53935', fontSize: '10px' }}>
                    {arg.side === 'pour' ? '👍 Pour' : '👎 Contre'}
                  </span>
                  <p style={{ marginTop: '2px' }}>{arg.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onClose} style={{
            padding: '10px 32px', background: '#4CAF50', color: '#fff',
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
          }}>
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', padding: '24px', width: '540px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', color: 'var(--text-primary)', boxShadow: 'var(--shadow-modal)' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' };
const badgeStyle: React.CSSProperties = { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', color: '#fff' };
const deleteBtnStyle: React.CSSProperties = { width: '28px', height: '28px', background: 'rgba(229,57,53,0.15)', border: '1px solid #e53935', borderRadius: '6px', color: '#e57373', fontSize: '14px', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' };
const editBtnStyle: React.CSSProperties = { width: '28px', height: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const editInputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', boxSizing: 'border-box' };
const saveBtnStyle: React.CSSProperties = { padding: '5px 14px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const cancelBtnStyle: React.CSSProperties = { padding: '5px 14px', background: 'transparent', color: '#888', border: '1px solid #0f3460', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const sectionStyle: React.CSSProperties = { borderTop: '1px solid #0f3460', paddingTop: '16px', marginTop: '16px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' };

export default FeuilleModal;
