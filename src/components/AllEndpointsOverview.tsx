import type { StatsData } from '../types/stats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AllEndpointsOverviewProps {
  data: StatsData;
}

export function AllEndpointsOverview({ data }: AllEndpointsOverviewProps) {
  const endpointData = data.searchStats.map((stat) => {
    const counters = stat.serviceStatistics.Counters;
    const totalDocs = stat.indexStatistics.value.reduce(
      (sum, idx) => sum + idx.documentCount,
      0
    );
    const totalStorage = stat.indexStatistics.value.reduce(
      (sum, idx) => sum + idx.storageSize,
      0
    );
    const totalVectorSize = stat.indexStatistics.value.reduce(
      (sum, idx) => sum + idx.vectorIndexSize,
      0
    );

    return {
      name: extractEndpointName(stat.endpoint),
      fullEndpoint: stat.endpoint,
      indexes: counters.IndexCounter.Usage,
      indexQuota: counters.IndexCounter.Quota,
      documents: totalDocs,
      storageGB: totalStorage / (1024 * 1024 * 1024),
      vectorSizeGB: totalVectorSize / (1024 * 1024 * 1024),
      storagePct: counters.StorageSizeCounter.Quota
        ? (counters.StorageSizeCounter.Usage / counters.StorageSizeCounter.Quota) * 100
        : 0,
      vectorPct: counters.VectorIndexSizeCounter.Quota
        ? (counters.VectorIndexSizeCounter.Usage / counters.VectorIndexSizeCounter.Quota) * 100
        : 0,
    };
  });

  return (
    <section className="all-endpoints-overview">
      <h2>All Endpoints Comparison ({data.searchStats.length} endpoints)</h2>

      <div className="comparison-charts">
        <div className="chart-container">
          <h3>Index Usage by Endpoint</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={endpointData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={180} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p className="tooltip-title">{d.name}</p>
                      <p>Indexes: {d.indexes} / {d.indexQuota ?? '∞'}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="indexes" fill="#4f46e5" name="Indexes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Document Count by Endpoint</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={endpointData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
              <YAxis type="category" dataKey="name" width={180} />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), 'Documents']}
              />
              <Bar dataKey="documents" fill="#06b6d4" name="Documents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container wide">
          <h3>Storage Usage by Endpoint</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={endpointData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${v.toFixed(2)} GB`} />
              <YAxis type="category" dataKey="name" width={180} />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(3)} GB`,
                  name === 'storageGB' ? 'Storage' : 'Vector Index',
                ]}
              />
              <Legend />
              <Bar dataKey="storageGB" fill="#10b981" name="Storage" />
              <Bar dataKey="vectorSizeGB" fill="#8b5cf6" name="Vector Index" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container wide">
          <h3>Quota Usage % by Endpoint</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={endpointData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={180} />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)}%`,
                  name === 'storagePct' ? 'Storage Quota' : 'Vector Quota',
                ]}
              />
              <Legend />
              <Bar dataKey="storagePct" fill="#f59e0b" name="Storage Quota" />
              <Bar dataKey="vectorPct" fill="#ef4444" name="Vector Quota" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="endpoints-table">
        <h3>Endpoints Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Indexes</th>
              <th>Documents</th>
              <th>Storage</th>
              <th>Vector Index</th>
              <th>Storage %</th>
              <th>Vector %</th>
            </tr>
          </thead>
          <tbody>
            {endpointData.map((ep) => (
              <tr key={ep.fullEndpoint}>
                <td title={ep.fullEndpoint}>{ep.name}</td>
                <td>{ep.indexes} / {ep.indexQuota ?? '∞'}</td>
                <td>{ep.documents.toLocaleString()}</td>
                <td>{formatBytes(ep.storageGB * 1024 * 1024 * 1024)}</td>
                <td>{formatBytes(ep.vectorSizeGB * 1024 * 1024 * 1024)}</td>
                <td className={getPercentClass(ep.storagePct)}>{ep.storagePct.toFixed(2)}%</td>
                <td className={getPercentClass(ep.vectorPct)}>{ep.vectorPct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getPercentClass(pct: number): string {
  if (pct >= 90) return 'pct-critical';
  if (pct >= 70) return 'pct-warning';
  return 'pct-ok';
}
