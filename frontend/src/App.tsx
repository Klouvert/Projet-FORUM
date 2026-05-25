import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';

const AppContent = () => {
  const { user } = useAuth();
  return user ? <Home /> : <Login />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;