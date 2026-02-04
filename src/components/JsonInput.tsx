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
      <button onClick={handleParse} disabled={!jsonText.trim()}>
        Visualize
      </button>
    </div>
  );
}
