import { useState } from 'react';
import type { Noeud } from '../../types';
import VoteSlider from '../ui/VoteSlider';
import ScoreChart from '../ui/ScoreChart';

interface FleurModalProps {
  noeud: Noeud;
  onClose: () => void;
  onVote: (noeudId: number, score: number) => void;
  onAddAmendement: (noeudId: number, content: string) => void;
}

const FleurModal = ({ noeud, onClose, onVote, onAddAmendement }: FleurModalProps) => {
  const [newAmendement, setNewAmendement] = useState('');
  const [activeAmendement, setActiveAmendement] = useState<number | null>(null);

  const handleAddAmendement = () => {
    if (!newAmendement.trim()) return;
    onAddAmendement(noeud.id, newAmendement.trim());
    setNewAmendement('');
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={headerStyle}>
          <div>
            <span style={{ ...badgeStyle, background: '#2196F3' }}>🌸 Fleur</span>
            <h2 style={{ fontSize: '18px', marginTop: '8px' }}>{noeud.title}</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          {noeud.description}
        </p>

        {/* Stats */}
        <ScoreChart stats={noeud.stats} />

        {/* Vote */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Votre vote</h3>
          <VoteSlider onVote={(score) => onVote(noeud.id, score)} />
        </div>

        {/* Amendements */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Amendements ({noeud.amendements.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {noeud.amendements.map((amendement) => (
              <div key={amendement.id} style={{
                background: '#1a1a2e',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #0f3460',
              }}>
                {/* Header amendement */}
                <div
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => setActiveAmendement(
                    activeAmendement === amendement.id ? null : amendement.id
                  )}
                >
                  <p style={{ fontSize: '13px', color: '#ddd' }}>{amendement.content}</p>
                  <span style={{ color: '#888', fontSize: '11px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    {amendement.stats.average.toFixed(1)}/10 · {activeAmendement === amendement.id ? '▲' : '▼'}
                  </span>
                </div>

                {/* Arguments de l'amendement */}
                {activeAmendement === amendement.id && (
                  <div style={{ padding: '0 14px 12px', borderTop: '1px solid #0f3460' }}>
                    <ScoreChart stats={amendement.stats} />
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {amendement.arguments.map((arg) => (
                        <li key={arg.id} style={{
                          padding: '8px 10px',
                          background: arg.type === 'pour' ? 'rgba(76,175,80,0.1)' : 'rgba(229,57,53,0.1)',
                          borderLeft: `3px solid ${arg.type === 'pour' ? '#4CAF50' : '#e53935'}`,
                          borderRadius: '0 6px 6px 0',
                          fontSize: '12px',
                          color: '#ccc',
                        }}>
                          <span style={{ color: arg.type === 'pour' ? '#4CAF50' : '#e53935', fontSize: '10px' }}>
                            {arg.type === 'pour' ? '👍 Pour' : '👎 Contre'}
                          </span>
                          <p style={{ marginTop: '2px' }}>{arg.content}</p>
                        </li>
                      ))}
                      {amendement.arguments.length === 0 && (
                        <p style={{ color: '#666', fontSize: '12px' }}>Aucun argument.</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {noeud.amendements.length === 0 && (
              <p style={{ color: '#666', fontSize: '13px' }}>Aucun amendement pour l'instant.</p>
            )}
          </div>
        </div>

        {/* Ajouter un amendement */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Proposer un amendement</h3>
          <textarea
            value={newAmendement}
            onChange={(e) => setNewAmendement(e.target.value)}
            placeholder="Rédigez votre amendement..."
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
          <button onClick={handleAddAmendement} style={{
            marginTop: '8px',
            padding: '8px 20px',
            background: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}>
            Publier l'amendement
          </button>
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
  background: '#16213e',
  borderRadius: '12px',
  padding: '24px',
  width: '580px',
  maxWidth: '95vw',
  maxHeight: '85vh',
  overflowY: 'auto',
  color: '#e0e0e0',
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '10px',
};

export default FleurModal;