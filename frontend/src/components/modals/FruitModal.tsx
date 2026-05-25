import type { Noeud } from '../../types';
import VoteSlider from '../ui/VoteSlider';
import ScoreChart from '../ui/ScoreChart';

interface FruitModalProps {
  noeud: Noeud;
  onClose: () => void;
  onVote: (noeudId: number, score: number) => void;
}

const FruitModal = ({ noeud, onClose, onVote }: FruitModalProps) => {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={headerStyle}>
          <div>
            <span style={{ ...badgeStyle, background: '#FFC107', color: '#000' }}>🍊 Fruit</span>
            <h2 style={{ fontSize: '18px', marginTop: '8px' }}>{noeud.title}</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          {noeud.description}
        </p>

        {/* Stats */}
        <ScoreChart stats={noeud.stats} />

        {/* Amendements validés */}
        {noeud.amendements.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Amendements intégrés ({noeud.amendements.length})</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {noeud.amendements.map((amendement) => (
                <li key={amendement.id} style={{
                  padding: '10px 14px',
                  background: '#1a1a2e',
                  borderRadius: '8px',
                  borderLeft: '3px solid #FFC107',
                  fontSize: '13px',
                  color: '#ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span>{amendement.content}</span>
                  <span style={{ color: '#FFC107', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {amendement.stats.average.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vote final */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Vote final sur la proposition</h3>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>
            Cette proposition sera validée en feuille si elle atteint le seuil défini dans les racines.
          </p>
          <VoteSlider onVote={(score) => onVote(noeud.id, score)} />
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
  width: '540px',
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

export default FruitModal;