import { useState } from 'react';
import type { IdeaDetail } from '../../types';
import VoteSlider from '../ui/VoteSlider';
import ScoreChart from '../ui/ScoreChart';
import { useAuth } from '../../context/AuthContext';

interface FruitModalProps {
  idea: IdeaDetail;
  onClose: () => void;
  onVote: (ideaId: string, score: number) => void;
  onPromote: (ideaId: string) => Promise<void>;
  onDelete: (ideaId: string) => Promise<void>;
  onUpdateIdea: (ideaId: string, title: string, content: string) => Promise<void>;
}

const FruitModal = ({ idea: initialIdea, onClose, onVote, onPromote, onDelete, onUpdateIdea }: FruitModalProps) => {
  const { user } = useAuth();
  const isAuthor = user?.userId === initialIdea.authorId;
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
            <span style={{ ...badgeStyle, background: '#FFC107', color: '#000' }}>🍊 Fruit</span>
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
              <button onClick={() => { setEditTitle(idea.title); setEditContent(idea.content); setEditingIdea(true); }} title="Modifier l'idée" style={iconBtnStyle}>✏</button>
            )}
            {isAdmin && (
              <button onClick={() => onDelete(idea.id)} title="Supprimer (admin)" style={deleteBtnStyle}>🗑</button>
            )}
            <button onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>
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
            <h3 style={sectionTitleStyle}>Amendements intégrés ({idea.amendments.length})</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {idea.amendments.map((amendment) => (
                <li key={amendment.id} style={{
                  padding: '10px 14px', background: '#1a1a2e', borderRadius: '8px',
                  borderLeft: '3px solid #FFC107', fontSize: '13px', color: '#ddd',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                }}>
                  <span>{amendment.content}</span>
                  <span style={{ color: '#FFC107', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {amendment.averageScore.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Vote final sur la proposition</h3>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>
            Cette proposition sera validée en feuille si elle atteint le seuil défini dans les racines.
          </p>
          <VoteSlider onVote={(score) => onVote(idea.id, score)} />
        </div>

        {isAuthor && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Progression</h3>
            <button onClick={() => onPromote(idea.id)} style={promoteBtnStyle}>Promouvoir en Feuille 🍃</button>
          </div>
        )}

      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', padding: '24px', width: '540px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', color: 'var(--text-primary)', boxShadow: 'var(--shadow-modal)' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' };
const badgeStyle: React.CSSProperties = { padding: '3px 10px', borderRadius: '12px', fontSize: '11px' };
const deleteBtnStyle: React.CSSProperties = { background: 'rgba(229,57,53,0.15)', border: '1px solid #e53935', borderRadius: '6px', color: '#e57373', fontSize: '14px', cursor: 'pointer', padding: '3px 8px' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' };
const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' };
const editInputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', boxSizing: 'border-box' };
const saveBtnStyle: React.CSSProperties = { padding: '5px 14px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const cancelBtnStyle: React.CSSProperties = { padding: '5px 14px', background: 'transparent', color: '#888', border: '1px solid #0f3460', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const sectionStyle: React.CSSProperties = { borderTop: '1px solid #0f3460', paddingTop: '16px', marginTop: '16px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' };
const promoteBtnStyle: React.CSSProperties = { padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };

export default FruitModal;
