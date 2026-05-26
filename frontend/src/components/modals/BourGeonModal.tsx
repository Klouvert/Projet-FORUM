import { useState } from 'react';
import type { IdeaDetail } from '../../types';
import VoteSlider from '../ui/VoteSlider';
import ScoreChart from '../ui/ScoreChart';
import { useAuth } from '../../context/AuthContext';

interface BourGeonModalProps {
  idea: IdeaDetail;
  onClose: () => void;
  onVote: (ideaId: string, score: number) => void;
  onAddArgument: (ideaId: string, content: string, side: 'pour' | 'contre') => Promise<void>;
  onPromote: (ideaId: string) => Promise<void>;
}

const BourGeonModal = ({ idea, onClose, onVote, onAddArgument, onPromote }: BourGeonModalProps) => {
  const { user } = useAuth();
  const isAuthor = user?.userId === idea.authorId;
  const [newArgument, setNewArgument] = useState('');
  const [argumentSide, setArgumentSide] = useState<'pour' | 'contre'>('pour');
  const [argFeedback, setArgFeedback] = useState<'success' | 'error' | null>(null);
  const [argLoading, setArgLoading] = useState(false);

  const handleAddArgument = async () => {
    if (!newArgument.trim()) return;
    setArgLoading(true);
    try {
      await onAddArgument(idea.id, newArgument.trim(), argumentSide);
      setNewArgument('');
      setArgFeedback('success');
      setTimeout(() => setArgFeedback(null), 2500);
    } catch {
      setArgFeedback('error');
      setTimeout(() => setArgFeedback(null), 2500);
    } finally {
      setArgLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="modal-animate" style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <div>
            <span style={{ ...badgeStyle, background: '#9C27B0' }}>🌱 Bourgeon</span>
            <h2 style={{ fontSize: '18px', marginTop: '8px' }}>{idea.title}</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          {idea.content}
        </p>

        <ScoreChart averageScore={idea.averageScore} voteCount={idea.voteCount} />

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Votre vote</h3>
          <VoteSlider onVote={(score) => onVote(idea.id, score)} />
        </div>

        {isAuthor && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Progression</h3>
            <button onClick={() => onPromote(idea.id)} style={promoteBtnStyle}>
              Promouvoir en Fleur 🌸
            </button>
          </div>
        )}

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Arguments ({idea.arguments.length})</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {idea.arguments.map((arg) => (
              <li key={arg.id} style={{
                padding: '10px 12px',
                background: arg.side === 'pour' ? 'rgba(76,175,80,0.1)' : 'rgba(229,57,53,0.1)',
                borderLeft: `3px solid ${arg.side === 'pour' ? '#4CAF50' : '#e53935'}`,
                borderRadius: '0 6px 6px 0',
                fontSize: '13px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: arg.side === 'pour' ? '#4CAF50' : '#e53935', fontSize: '11px', textTransform: 'uppercase' }}>
                    {arg.side === 'pour' ? '👍 Pour' : '👎 Contre'}
                  </span>
                  <span style={{ color: '#888', fontSize: '11px' }}>
                    {arg.averageScore.toFixed(1)}/10 · {arg.voteCount} votes
                  </span>
                </div>
                <p style={{ color: '#ddd', marginTop: '4px' }}>{arg.content}</p>
              </li>
            ))}
            {idea.arguments.length === 0 && (
              <p style={{ color: '#666', fontSize: '13px' }}>Aucun argument pour l'instant.</p>
            )}
          </ul>
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Ajouter un argument</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {(['pour', 'contre'] as const).map((side) => (
              <button
                key={side}
                onClick={() => setArgumentSide(side)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  background: argumentSide === side
                    ? (side === 'pour' ? '#4CAF50' : '#e53935')
                    : '#333',
                  color: '#fff',
                }}
              >
                {side === 'pour' ? '👍 Pour' : '👎 Contre'}
              </button>
            ))}
          </div>
          <textarea
            value={newArgument}
            onChange={(e) => setNewArgument(e.target.value)}
            placeholder="Rédigez votre argument..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              background: '#1a1a2e',
              border: '1px solid #0f3460',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '13px',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleAddArgument} disabled={argLoading} style={{
              padding: '8px 20px',
              background: '#0f3460',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: argLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}>
              {argLoading ? 'Publication...' : "Publier l'argument"}
            </button>
            {argFeedback === 'success' && (
              <span style={{ color: '#4CAF50', fontSize: '13px' }}>✓ Publié</span>
            )}
            {argFeedback === 'error' && (
              <span style={{ color: '#e53935', fontSize: '13px' }}>Erreur</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--bg-panel)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  width: '560px',
  maxWidth: '95vw',
  maxHeight: '85vh',
  overflowY: 'auto',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-modal)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const badgeStyle: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  color: '#fff',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888',
  fontSize: '18px',
  cursor: 'pointer',
};

const sectionStyle: React.CSSProperties = {
  borderTop: '1px solid #0f3460',
  paddingTop: '16px',
  marginTop: '16px',
};

const promoteBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  background: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '10px',
};

export default BourGeonModal;
