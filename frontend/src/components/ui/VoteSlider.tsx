import { useState } from 'react';

interface VoteSliderProps {
  onVote: (score: number) => void | Promise<void>;
  currentScore?: number;
  disabled?: boolean;
}

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? '#212121' : '#ffffff';
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
  const [voteError, setVoteError] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleVote = async () => {
    setVoting(true);
    setVoteError(false);
    try {
      await onVote(score);
      setVoted(true);
    } catch {
      setVoteError(true);
    } finally {
      setVoting(false);
    }
  };

  const busy = disabled || voted || voting;

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Votre note</span>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: SCORE_COLORS[score] }}>
          {score}/10
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={score}
        disabled={busy}
        onChange={(e) => setScore(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: SCORE_COLORS[score],
          cursor: busy ? 'not-allowed' : 'pointer',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i + 1} style={{ fontSize: '9px', color: '#555' }}>{i + 1}</span>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={busy}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '8px',
          background: voted ? '#2e7d32' : voteError ? '#c62828' : SCORE_COLORS[score],
          color: contrastColor(voted ? '#2e7d32' : voteError ? '#c62828' : SCORE_COLORS[score]),
          border: 'none',
          borderRadius: '6px',
          cursor: busy ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          transition: 'background 0.2s',
        }}
      >
        {voting ? 'Envoi...' : voted ? '✓ Vote enregistré' : voteError ? '✗ Erreur — réessayer' : 'Voter'}
      </button>
    </div>
  );
};

export default VoteSlider;