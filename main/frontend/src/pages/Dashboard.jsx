import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Layout from '../components/Layout.jsx';
import { Button, Input, Card, Badge } from '../components/ui.jsx';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  async function load() {
    try {
      const { tasks } = await api.listTasks();
      setTasks(tasks);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function addTask(e) {
    e?.preventDefault();
    if (!title.trim()) return;
    await api.createTask({ title, priority });
    setTitle('');
    setPriority('medium');
    load();
  }

  async function move(task, status) {
    await api.updateTask(task._id, { status });
    load();
  }
  async function remove(task) {
    await api.deleteTask(task._id);
    load();
  }

  async function getSuggestions() {
    setLoadingAI(true);
    setError('');
    try {
      const { suggestions } = await api.aiSuggest();
      setSuggestions(suggestions);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAI(false);
    }
  }
  async function acceptSuggestion(s) {
    await api.createTask({ title: s.title, priority: s.priority });
    setSuggestions(suggestions.filter((x) => x.title !== s.title));
    load();
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" onClick={getSuggestions} disabled={loadingAI}>
          {loadingAI ? 'Thinking...' : '✨ Suggest tasks (AI)'}
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Card className="mb-6">
        <form onSubmit={addTask} className="flex gap-2">
          <Input placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}
            className="rounded-md border border-border bg-card px-2 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button type="submit">Add</Button>
        </form>
      </Card>

      {suggestions.length > 0 && (
        <Card className="mb-6">
          <h2 className="mb-2 text-sm font-semibold">AI suggestions</h2>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div key={s.title} className="flex items-center justify-between rounded border border-border px-3 py-2">
                <span className="text-sm">{s.title} <Badge color={s.priority}>{s.priority}</Badge></span>
                <Button variant="ghost" onClick={() => acceptSuggestion(s)}>Add</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <Card key={col.key}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{col.label}</h2>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === col.key).map((t) => (
                <div key={t._id} className="rounded border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm">{t.title}</span>
                    <Badge color={t.priority}>{t.priority}</Badge>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                      <button key={c.key} onClick={() => move(t, c.key)}
                        className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
                        → {c.label}
                      </button>
                    ))}
                    <button onClick={() => remove(t)} className="ml-auto text-xs text-red-600">delete</button>
                  </div>
                </div>
              ))}
              {tasks.filter((t) => t.status === col.key).length === 0 && (
                <p className="text-xs text-muted-foreground">Empty</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
