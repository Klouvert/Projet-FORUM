import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Tab = 'login' | 'register';

const Login = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regDisplay, setRegDisplay] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status === 401
        ? 'Email ou mot de passe incorrect.'
        : 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword, regDisplay || regName);
    } catch {
      setError('Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#16213e',
        borderRadius: '12px',
        padding: '32px',
        width: '380px',
        maxWidth: '95vw',
        color: '#e0e0e0',
        border: '1px solid #0f3460',
      }}>
        <h1 style={{ fontSize: '22px', marginBottom: '24px', textAlign: 'center', color: '#fff' }}>
          🌳 Arbre Intelligence
        </h1>

        <div style={{ display: 'flex', borderBottom: '1px solid #0f3460', marginBottom: '24px' }}>
          {(['login', 'register'] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(null); }} style={{
              flex: 1,
              padding: '10px',
              background: tab === t ? '#0f3460' : 'transparent',
              color: tab === t ? '#e0e0e0' : '#888',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}>
              {t === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(229,57,53,0.15)',
            border: '1px solid #e53935',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#e57373',
          }}>
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="email" placeholder="Email" value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Mot de passe" value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)} required style={inputStyle} />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="text" placeholder="Nom d'utilisateur" value={regName}
              onChange={(e) => setRegName(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="Nom affiché (optionnel)" value={regDisplay}
              onChange={(e) => setRegDisplay(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Email" value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Mot de passe (min. 6 caractères)" value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)} required style={inputStyle} />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Création...' : 'Créer un compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#1a1a2e',
  border: '1px solid #0f3460',
  borderRadius: '6px',
  color: '#e0e0e0',
  fontSize: '14px',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  padding: '11px',
  background: '#0f3460',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  marginTop: '4px',
};

export default Login;
