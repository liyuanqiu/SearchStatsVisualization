import { useState } from 'react';
import type { StatsData } from '../types/stats';
import { ServiceOverview } from './ServiceOverview';
import { IndexCharts } from './IndexCharts';
import { AllEndpointsOverview } from './AllEndpointsOverview';

interface DashboardProps {
  data: StatsData;
  onReset: () => void;
}

type ViewMode = 'all' | 'single';

export function Dashboard({ data, onReset }: DashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(
    data.searchStats[0]?.endpoint || ''
  );

  const selectedStat = data.searchStats.find(
    (s) => s.endpoint === selectedEndpoint
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Search Stats Visualization</h1>
        <button onClick={onReset} className="secondary">
          ← Load New Data
        </button>
      </header>

      <div className="view-tabs">
        <button
          className={`tab ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          All Endpoints
        </button>
        <button
          className={`tab ${viewMode === 'single' ? 'active' : ''}`}
          onClick={() => setViewMode('single')}
        >
          Single Endpoint
        </button>
      </div>

      {viewMode === 'all' ? (
        <AllEndpointsOverview data={data} />
      ) : (
        <>
          <div className="endpoint-selector">
            <label htmlFor="endpoint">Select Endpoint:</label>
            <select
              id="endpoint"
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
            >
              {data.searchStats.map((stat) => (
                <option key={stat.endpoint} value={stat.endpoint}>
                  {extractEndpointName(stat.endpoint)}
                </option>
              ))}
            </select>
          </div>

          {selectedStat && (
            <>
              <ServiceOverview stat={selectedStat} />
              <IndexCharts stat={selectedStat} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function extractEndpointName(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    return url.hostname.split('.')[0];
  } catch {
    return endpoint;
  }
}
