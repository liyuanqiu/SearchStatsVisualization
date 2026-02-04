import { useState, useMemo } from 'react';
import type { SearchStat } from '../types/stats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface IndexChartsProps {
  stat: SearchStat;
}

type SortField = 'documentCount' | 'storageSize' | 'vectorIndexSize';

const COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export function IndexCharts({ stat }: IndexChartsProps) {
  const [sortField, setSortField] = useState<SortField>('storageSize');
  const [showEmpty, setShowEmpty] = useState(false);
  const [topN, setTopN] = useState(10);

  const indexes = stat.indexStatistics.value;

  const filteredAndSorted = useMemo(() => {
    let result = showEmpty
      ? indexes
      : indexes.filter((i) => i.documentCount > 0 || i.storageSize > 0);

    result = [...result].sort((a, b) => b[sortField] - a[sortField]);

    return result.slice(0, topN);
  }, [indexes, sortField, showEmpty, topN]);

  const totalStats = useMemo(() => {
    return indexes.reduce(
      (acc, idx) => ({
        documents: acc.documents + idx.documentCount,
        storage: acc.storage + idx.storageSize,
        vectorSize: acc.vectorSize + idx.vectorIndexSize,
      }),
      { documents: 0, storage: 0, vectorSize: 0 }
    );
  }, [indexes]);

  const pieData = useMemo(() => {
    return filteredAndSorted.map((idx) => ({
      name: extractIndexName(idx.name),
      value: idx[sortField],
    }));
  }, [filteredAndSorted, sortField]);

  return (
    <section className="index-charts">
      <h2>Index Statistics ({indexes.length} indexes)</h2>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Total Documents</span>
          <span className="summary-value">
            {totalStats.documents.toLocaleString()}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Storage</span>
          <span className="summary-value">{formatBytes(totalStats.storage)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Vector Index</span>
          <span className="summary-value">
            {formatBytes(totalStats.vectorSize)}
          </span>
        </div>
      </div>

      <div className="controls">
        <label>
          Sort by:
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="storageSize">Storage Size</option>
            <option value="documentCount">Document Count</option>
            <option value="vectorIndexSize">Vector Index Size</option>
          </select>
        </label>
        <label>
          Top:
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showEmpty}
            onChange={(e) => setShowEmpty(e.target.checked)}
          />
          Show empty indexes
        </label>
      </div>

      <div className="charts-row">
        <div className="chart-container wide">
          <h3>Top Indexes by {getSortLabel(sortField)}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={filteredAndSorted.map((idx) => ({
                name: extractIndexName(idx.name),
                documentCount: idx.documentCount,
                storageSize: idx.storageSize,
                vectorIndexSize: idx.vectorIndexSize,
              }))}
              layout="vertical"
            >
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  sortField.includes('Size') ? formatBytes(v) : v.toLocaleString()
                }
              />
              <YAxis type="category" dataKey="name" width={200} />
              <Tooltip
                formatter={(value, name) => [
                  typeof name === 'string' && name.includes('Size')
                    ? formatBytes(Number(value))
                    : Number(value).toLocaleString(),
                  formatFieldName(String(name)),
                ]}
              />
              <Bar dataKey={sortField} fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) =>
                  (percent ?? 0) > 0.05
                    ? `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`
                    : ''
                }
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  sortField.includes('Size')
                    ? formatBytes(Number(value))
                    : Number(value).toLocaleString()
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="index-table">
        <h3>All Indexes</h3>
        <table>
          <thead>
            <tr>
              <th>Index Name</th>
              <th>Documents</th>
              <th>Storage Size</th>
              <th>Vector Index Size</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((idx) => (
              <tr key={idx.name}>
                <td title={idx.name}>{extractIndexName(idx.name)}</td>
                <td>{idx.documentCount.toLocaleString()}</td>
                <td>{formatBytes(idx.storageSize)}</td>
                <td>{formatBytes(idx.vectorIndexSize)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function extractIndexName(fullName: string): string {
  // Extract the guid and type from names like "dg-02d6563f-c767-4662-85c1-3e5b7f77d9d7-dataasset-20240925-..."
  const match = fullName.match(/dg-([a-f0-9-]{36})-(\w+)/);
  if (match) {
    return `${match[1].substring(0, 8)}...${match[2]}`;
  }
  return fullName.length > 40 ? fullName.substring(0, 40) + '...' : fullName;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getSortLabel(field: SortField): string {
  switch (field) {
    case 'documentCount':
      return 'Document Count';
    case 'storageSize':
      return 'Storage Size';
    case 'vectorIndexSize':
      return 'Vector Index Size';
  }
}

function formatFieldName(field: string): string {
  switch (field) {
    case 'documentCount':
      return 'Documents';
    case 'storageSize':
      return 'Storage';
    case 'vectorIndexSize':
      return 'Vector Index';
    default:
      return field;
  }
}
