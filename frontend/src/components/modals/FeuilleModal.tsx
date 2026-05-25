import type { IdeaDetail } from '../../types';
import ScoreChart from '../ui/ScoreChart';

interface FeuilleModalProps {
  idea: IdeaDetail;
  onClose: () => void;
}

const FeuilleModal = ({ idea, onClose }: FeuilleModalProps) => {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <div>
            <span style={{ ...badgeStyle, background: '#4CAF50' }}>🍃 Feuille</span>
            <h2 style={{ fontSize: '18px', marginTop: '8px' }}>{idea.title}</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{
          background: 'rgba(76,175,80,0.15)', border: '1px solid #4CAF50', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center',
          gap: '8px', fontSize: '13px', color: '#4CAF50',
        }}>
          ✓ Proposition validée et intégrée
        </div>

        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          {idea.content}
        </p>

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
const modalStyle: React.CSSProperties = { background: '#16213e', borderRadius: '12px', padding: '24px', width: '540px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', color: '#e0e0e0' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' };
const badgeStyle: React.CSSProperties = { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', color: '#fff' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' };
const sectionStyle: React.CSSProperties = { borderTop: '1px solid #0f3460', paddingTop: '16px', marginTop: '16px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' };

export default FeuilleModal;
