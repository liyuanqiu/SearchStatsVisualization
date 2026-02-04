import { useState } from 'react';
import type { StatsData } from '../types/stats';

interface JsonInputProps {
  onDataLoad: (data: StatsData) => void;
}

export function JsonInput({ onDataLoad }: JsonInputProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonText) as StatsData;
      if (!parsed.searchStats || !Array.isArray(parsed.searchStats)) {
        throw new Error('Invalid format: expected { searchStats: [...] }');
      }
      setError(null);
      onDataLoad(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/data/stats.json');
      const data = await response.json();
      setJsonText(JSON.stringify(data, null, 2));
      onDataLoad(data);
      setError(null);
    } catch {
      setError('Failed to load sample data');
    }
  };

  return (
    <div className="json-input">
      <h2>Paste Search Stats JSON</h2>
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder='{"searchStats": [...]}'
        rows={12}
      />
      {error && <div className="error">{error}</div>}
      <div className="button-group">
        <button onClick={handleParse} disabled={!jsonText.trim()}>
          Visualize
        </button>
        <button onClick={handleLoadSample} className="secondary">
          Load Sample Data
        </button>
      </div>
    </div>
  );
}
