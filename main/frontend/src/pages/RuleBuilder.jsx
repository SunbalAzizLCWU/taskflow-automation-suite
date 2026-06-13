import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Layout from '../components/Layout.jsx';
import { Button, Input, Card } from '../components/ui.jsx';

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

// Chat-like AI rule builder: type plain English, get a structured rule draft,
// review it, then save. Also lists existing rules with their webhook URLs.
export default function RuleBuilder() {
  const [description, setDescription] = useState('');
  const [draft, setDraft] = useState(null);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadRules() {
    const { rules } = await api.listRules();
    setRules(rules);
  }
  useEffect(() => { loadRules(); }, []);

  async function generate(e) {
    e?.preventDefault();
    if (!description.trim()) return;
    setBusy(true);
    setError('');
    setDraft(null);
    try {
      const { rule } = await api.aiRule(description);
      setDraft(rule);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    await api.createRule(draft);
    setDraft(null);
    setDescription('');
    loadRules();
  }
  async function removeRule(id) {
    await api.deleteRule(id);
    loadRules();
  }

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-semibold">AI Rule Builder</h1>

      <Card className="mb-6">
        <form onSubmit={generate} className="space-y-3">
          <label className="text-sm text-muted-foreground">
            Describe an automation in plain English
          </label>
          <div className="flex gap-2">
            <Input
              placeholder='e.g. "When I receive a webhook, create a high priority task"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" disabled={busy}>{busy ? 'Generating...' : 'Generate'}</Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {draft && (
          <div className="mt-4 rounded border border-border bg-muted p-3">
            <h3 className="mb-2 text-sm font-semibold">Draft rule (review then save)</h3>
            <pre className="overflow-auto text-xs">{JSON.stringify(draft, null, 2)}</pre>
            <div className="mt-3 flex gap-2">
              <Button onClick={saveDraft}>Save rule</Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>Discard</Button>
            </div>
          </div>
        )}
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Your rules</h2>
      <div className="space-y-3">
        {rules.map((r) => (
          <Card key={r._id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.conditions.length} condition(s), {r.actions.length} action(s)
                </p>
              </div>
              <Button variant="danger" onClick={() => removeRule(r._id)}>Delete</Button>
            </div>
            <div className="mt-2 rounded bg-muted p-2">
              <p className="text-xs text-muted-foreground">Webhook URL (POST here to trigger):</p>
              <code className="break-all text-xs">{API_BASE}/api/hooks/{r.webhookToken}</code>
            </div>
          </Card>
        ))}
        {rules.length === 0 && <p className="text-sm text-muted-foreground">No rules yet.</p>}
      </div>
    </Layout>
  );
}
