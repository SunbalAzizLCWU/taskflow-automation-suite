import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './ui.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold">TaskFlow</Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <Link to="/rules" className="hover:text-foreground">AI Rule Builder</Link>
            <Link to="/logs" className="hover:text-foreground">Logs</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user?.email}</span>
          <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
