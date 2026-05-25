import { useState } from 'react';

interface VoteSliderProps {
  onVote: (score: number) => void;
  currentScore?: number;
  disabled?: boolean;
}

const SCORE_COLORS: Record<number, string> = {
  1: '#b71c1c', 2: '#c62828', 3: '#e53935',
  4: '#fb8c00', 5: '#fdd835',
  6: '#c0ca33', 7: '#7cb342',
  8: '#43a047', 9: '#2e7d32', 10: '#1b5e20',
};

const VoteSlider = ({ onVote, currentScore, disabled = false }: VoteSliderProps) => {
  const [score, setScore] = useState<number>(currentScore ?? 5);
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    onVote(score);
    setVoted(true);
  };

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Votre note</span>
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: SCORE_COLORS[score],
        }}>
          {score}/10
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={score}
        disabled={disabled || voted}
        onChange={(e) => setScore(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: SCORE_COLORS[score],
          cursor: disabled || voted ? 'not-allowed' : 'pointer',
        }}
      />

      {/* Graduations */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i + 1} style={{ fontSize: '9px', color: '#555' }}>{i + 1}</span>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={disabled || voted}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '8px',
          background: voted ? '#333' : SCORE_COLORS[score],
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: disabled || voted ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          transition: 'background 0.2s',
        }}
      >
        {voted ? '✓ Vote enregistré' : 'Voter'}
      </button>
    </div>
  );
};

export default VoteSlider;