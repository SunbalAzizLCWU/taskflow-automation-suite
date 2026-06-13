import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Input, Card } from '../components/ui.jsx';

// Handles both login and register based on the `mode` prop.
export default function Auth({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="mb-4 text-sm text-muted-foreground">TaskFlow AI Automation Suite</p>
        <form onSubmit={onSubmit} className="space-y-3">
          {isRegister && (
            <Input placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          )}
          <Input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="password" placeholder="Password (min 8 chars)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Please wait...' : isRegister ? 'Sign up' : 'Log in'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isRegister ? (
            <>Have an account? <Link to="/login" className="text-primary">Log in</Link></>
          ) : (
            <>No account? <Link to="/register" className="text-primary">Sign up</Link></>
          )}
        </p>
      </Card>
    </div>
  );
}
