import { Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RuleBuilder from './pages/RuleBuilder.jsx';
import Logs from './pages/Logs.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/rules" element={<ProtectedRoute><RuleBuilder /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
    </Routes>
  );
}
