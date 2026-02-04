import { useState } from 'react';
import type { StatsData } from './types/stats';
import { JsonInput } from './components/JsonInput';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  const [data, setData] = useState<StatsData | null>(null);

  return (
    <div className="app">
      {data ? (
        <Dashboard data={data} onReset={() => setData(null)} />
      ) : (
        <div className="input-page">
          <h1>Search Stats Visualization</h1>
          <p className="subtitle">
            Visualize Azure Cognitive Search service statistics
          </p>
          <JsonInput onDataLoad={setData} />
        </div>
      )}
    </div>
  );
}

export default App;
