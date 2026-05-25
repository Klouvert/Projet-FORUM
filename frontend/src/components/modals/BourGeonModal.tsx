import { useState } from 'react';
import type { Noeud } from '../../types';
import VoteSlider from '../ui/VoteSlider';
import ScoreChart from '../ui/ScoreChart';

interface BourGeonModalProps {
  noeud: Noeud;
  onClose: () => void;
  onVote: (noeudId: number, score: number) => void;
  onAddArgument: (noeudId: number, content: string, type: 'pour' | 'contre') => void;
}

const BourGeonModal = ({ noeud, onClose, onVote, onAddArgument }: BourGeonModalProps) => {
  const [newArgument, setNewArgument] = useState('');
  const [argumentType, setArgumentType] = useState<'pour' | 'contre'>('pour');

  const handleAddArgument = () => {
    if (!newArgument.trim()) return;
    onAddArgument(noeud.id, newArgument.trim(), argumentType);
    setNewArgument('');
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={headerStyle}>
          <div>
            <span style={{ ...badgeStyle, background: '#9C27B0' }}>🌱 Bourgeon</span>
            <h2 style={{ fontSize: '18px', marginTop: '8px' }}>{noeud.title}</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Description */}
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

        {/* Arguments */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Arguments ({noeud.arguments.length})</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {noeud.arguments.map((arg) => (
              <li key={arg.id} style={{
                padding: '10px 12px',
                background: arg.type === 'pour' ? 'rgba(76,175,80,0.1)' : 'rgba(229,57,53,0.1)',
                borderLeft: `3px solid ${arg.type === 'pour' ? '#4CAF50' : '#e53935'}`,
                borderRadius: '0 6px 6px 0',
                fontSize: '13px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: arg.type === 'pour' ? '#4CAF50' : '#e53935', fontSize: '11px', textTransform: 'uppercase' }}>
                    {arg.type === 'pour' ? '👍 Pour' : '👎 Contre'}
                  </span>
                  <span style={{ color: '#888', fontSize: '11px' }}>
                    {arg.stats.average.toFixed(1)}/10 · {arg.stats.totalVotes} votes
                  </span>
                </div>
                <p style={{ color: '#ddd', marginTop: '4px' }}>{arg.content}</p>
              </li>
            ))}
            {noeud.arguments.length === 0 && (
              <p style={{ color: '#666', fontSize: '13px' }}>Aucun argument pour l'instant.</p>
            )}
          </ul>
        </div>

        {/* Ajouter un argument */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Ajouter un argument</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {(['pour', 'contre'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setArgumentType(type)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  background: argumentType === type
                    ? (type === 'pour' ? '#4CAF50' : '#e53935')
                    : '#333',
                  color: '#fff',
                }}
              >
                {type === 'pour' ? '👍 Pour' : '👎 Contre'}
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
          <button onClick={handleAddArgument} style={{
            marginTop: '8px',
            padding: '8px 20px',
            background: '#0f3460',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}>
            Publier l'argument
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
  width: '560px',
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

export default BourGeonModal;