import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Layout from '../components/Layout.jsx';
import { Button, Card } from '../components/ui.jsx';

const LEVEL_COLOR = {
  info: 'text-slate-600',
  warn: 'text-amber-600',
  error: 'text-red-600',
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { logs } = await api.listLogs();
      setLogs(logs);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function summarize() {
    setBusy(true);
    setError('');
    try {
      const { summary } = await api.aiSummarize();
      setSummary(summary);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Refresh</Button>
          <Button onClick={summarize} disabled={busy}>{busy ? 'Summarizing...' : '✨ Summarize (AI)'}</Button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {summary && (
        <Card className="mb-6">
          <h2 className="mb-1 text-sm font-semibold">AI summary</h2>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-border">
          {logs.map((l) => (
            <div key={l._id} className="py-2 text-sm">
              <span className={`font-mono text-xs ${LEVEL_COLOR[l.level] || ''}`}>[{l.level}]</span>{' '}
              <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>{' '}
              <span>{l.message}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="py-2 text-sm text-muted-foreground">No logs yet.</p>}
        </div>
      </Card>
    </Layout>
  );
}
