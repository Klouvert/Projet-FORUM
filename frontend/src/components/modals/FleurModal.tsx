import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { IdeaDetail, Amendment } from '../../types';
import VoteSlider from '../ui/VoteSlider';
import ScoreChart from '../ui/ScoreChart';
import { useAuth } from '../../context/AuthContext';

interface FleurModalProps {
  idea: IdeaDetail;
  onClose: () => void;
  onVote: (ideaId: string, score: number) => void;
  onAddAmendment: (ideaId: string, content: string) => Promise<void>;
  onPromote: (ideaId: string) => Promise<void>;
  onDelete: (ideaId: string) => Promise<void>;
  onUpdateIdea: (ideaId: string, title: string, content: string) => Promise<void>;
  onUpdateAmendment: (id: string, content: string) => Promise<void>;
  onDeleteAmendment: (id: string) => Promise<void>;
}

const FleurModal = ({
  idea: initialIdea, onClose, onVote, onAddAmendment, onPromote, onDelete,
  onUpdateIdea, onUpdateAmendment, onDeleteAmendment,
}: FleurModalProps) => {
  const { user } = useAuth();
  const isAuthor = user?.userId === initialIdea.authorId;
  const isAdmin = user?.isAdmin ?? false;

  const [idea, setIdea] = useState<IdeaDetail>(initialIdea);

  /* Edit idée */
  const [editingIdea, setEditingIdea] = useState(false);
  const [editTitle,   setEditTitle]   = useState(idea.title);
  const [editContent, setEditContent] = useState(idea.content);
  const [ideaSaving,  setIdeaSaving]  = useState(false);

  /* Nouvel amendement */
  const [newAmendment,  setNewAmendment]  = useState('');
  const [activeAmendment, setActiveAmendment] = useState<string | null>(null);
  const [amendFeedback, setAmendFeedback] = useState<'success' | 'error' | null>(null);
  const [amendLoading,  setAmendLoading]  = useState(false);

  /* Edit amendement */
  const [editAmendId,      setEditAmendId]      = useState<string | null>(null);
  const [editAmendContent, setEditAmendContent] = useState('');
  const [amendEditSaving,  setAmendEditSaving]  = useState(false);

  const handleSaveIdea = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setIdeaSaving(true);
    try {
      await onUpdateIdea(idea.id, editTitle.trim(), editContent.trim());
      setIdea(prev => ({ ...prev, title: editTitle.trim(), content: editContent.trim() }));
      setEditingIdea(false);
    } finally { setIdeaSaving(false); }
  };

  const handleAddAmendment = async () => {
    if (!newAmendment.trim()) return;
    setAmendLoading(true);
    try {
      await onAddAmendment(idea.id, newAmendment.trim());
      setNewAmendment('');
      setAmendFeedback('success');
      setTimeout(() => setAmendFeedback(null), 2500);
    } catch {
      setAmendFeedback('error');
      setTimeout(() => setAmendFeedback(null), 2500);
    } finally { setAmendLoading(false); }
  };

  const startEditAmend = (am: Amendment) => {
    setEditAmendId(am.id);
    setEditAmendContent(am.content);
    setActiveAmendment(null);
  };

  const handleSaveAmend = async () => {
    if (!editAmendId || !editAmendContent.trim()) return;
    setAmendEditSaving(true);
    try {
      await onUpdateAmendment(editAmendId, editAmendContent.trim());
      setIdea(prev => ({
        ...prev,
        amendments: prev.amendments.map(a => a.id === editAmendId ? { ...a, content: editAmendContent.trim() } : a),
      }));
      setEditAmendId(null);
    } finally { setAmendEditSaving(false); }
  };

  const handleDeleteAmend = async (amendId: string) => {
    await onDeleteAmendment(amendId);
    setIdea(prev => ({ ...prev, amendments: prev.amendments.filter(a => a.id !== amendId) }));
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="modal-animate" style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <div style={{ flex: 1 }}>
            <span style={{ ...badgeStyle, background: '#2196F3' }}>🌸 Fleur</span>
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

        {editingIdea ? (
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4}
            style={{ ...editInputStyle, resize: 'vertical', marginBottom: '16px' }} />
        ) : (
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{idea.content}</p>
        )}

        <ScoreChart averageScore={idea.averageScore} voteCount={idea.voteCount} />

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Votre vote</h3>
          <VoteSlider onVote={(score) => onVote(idea.id, score)} />
        </div>

        {isAuthor && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Progression</h3>
            <button onClick={() => onPromote(idea.id)} style={promoteBtnStyle}>Promouvoir en Fruit 🍊</button>
          </div>
        )}

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Amendements ({idea.amendments.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {idea.amendments.map((amendment) => {
              const canEdit = isAdmin || user?.userId === amendment.authorId;
              return (
                <div key={amendment.id} style={{ background: '#1a1a2e', borderRadius: '8px', overflow: 'hidden', border: '1px solid #0f3460' }}>
                  {editAmendId === amendment.id ? (
                    <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <textarea value={editAmendContent} onChange={(e) => setEditAmendContent(e.target.value)}
                        rows={2} style={{ ...editInputStyle, resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={handleSaveAmend} disabled={amendEditSaving} style={saveBtnStyle}>
                          {amendEditSaving ? '...' : 'Enregistrer'}
                        </button>
                        <button onClick={() => setEditAmendId(null)} style={cancelBtnStyle}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => setActiveAmendment(activeAmendment === amendment.id ? null : amendment.id)}
                      >
                        <p style={{ fontSize: '13px', color: '#ddd', flex: 1 }}>{amendment.content}</p>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '12px', flexShrink: 0 }}>
                          <span style={{ color: '#888', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {amendment.averageScore.toFixed(1)}/10 · {activeAmendment === amendment.id ? '▲' : '▼'}
                          </span>
                          {canEdit && (
                            <button onClick={(e) => { e.stopPropagation(); startEditAmend(amendment); }} title="Modifier" style={editBtnStyle}><Pencil size={14} /></button>
                          )}
                          {isAdmin && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAmend(amendment.id); }} title="Supprimer" style={deleteSmallBtnStyle}><Trash2 size={13} /></button>
                          )}
                        </div>
                      </div>
                      {activeAmendment === amendment.id && (
                        <div style={{ padding: '0 14px 12px', borderTop: '1px solid #0f3460' }}>
                          <ScoreChart averageScore={amendment.averageScore} voteCount={amendment.voteCount} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {idea.amendments.length === 0 && (
              <p style={{ color: '#666', fontSize: '13px' }}>Aucun amendement pour l'instant.</p>
            )}
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Proposer un amendement</h3>
          <textarea value={newAmendment} onChange={(e) => setNewAmendment(e.target.value)}
            placeholder="Rédigez votre amendement..." rows={3}
            style={{ width: '100%', padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '6px', color: '#e0e0e0', fontSize: '13px', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleAddAmendment} disabled={amendLoading} style={{
              padding: '8px 20px', background: '#2196F3', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: amendLoading ? 'not-allowed' : 'pointer', fontSize: '13px',
            }}>
              {amendLoading ? 'Publication...' : "Publier l'amendement"}
            </button>
            {amendFeedback === 'success' && <span style={{ color: '#4CAF50', fontSize: '13px' }}>✓ Publié</span>}
            {amendFeedback === 'error'   && <span style={{ color: '#e53935', fontSize: '13px' }}>Erreur</span>}
          </div>
        </div>

      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', padding: '24px', width: '580px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', color: 'var(--text-primary)', boxShadow: 'var(--shadow-modal)' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' };
const badgeStyle: React.CSSProperties = { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', color: '#fff' };
const deleteBtnStyle: React.CSSProperties = { width: '28px', height: '28px', background: 'rgba(229,57,53,0.15)', border: '1px solid #e53935', borderRadius: '6px', color: '#e57373', fontSize: '14px', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' };
const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' };
const editBtnStyle: React.CSSProperties = { width: '28px', height: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const editInputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', boxSizing: 'border-box' };
const saveBtnStyle: React.CSSProperties = { padding: '5px 14px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const cancelBtnStyle: React.CSSProperties = { padding: '5px 14px', background: 'transparent', color: '#888', border: '1px solid #0f3460', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const sectionStyle: React.CSSProperties = { borderTop: '1px solid #0f3460', paddingTop: '16px', marginTop: '16px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' };
const promoteBtnStyle: React.CSSProperties = { padding: '8px 20px', background: '#FFC107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };
const deleteSmallBtnStyle: React.CSSProperties = { width: '24px', height: '24px', background: 'rgba(229,57,53,0.12)', border: '1px solid #e53935', borderRadius: '4px', color: '#e57373', cursor: 'pointer', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

export default FleurModal;
