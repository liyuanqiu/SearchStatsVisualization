import type { SearchStat } from '../types/stats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ServiceOverviewProps {
  stat: SearchStat;
}

export function ServiceOverview({ stat }: ServiceOverviewProps) {
  const counters = stat.serviceStatistics.Counters;

  const counterData = [
    {
      name: 'Documents',
      usage: counters.DocumentCounter.Usage,
      quota: counters.DocumentCounter.Quota,
    },
    {
      name: 'Indexes',
      usage: counters.IndexCounter.Usage,
      quota: counters.IndexCounter.Quota,
    },
    {
      name: 'Indexers',
      usage: counters.IndexerCounter.Usage,
      quota: counters.IndexerCounter.Quota,
    },
    {
      name: 'Data Sources',
      usage: counters.DataSourceCounter.Usage,
      quota: counters.DataSourceCounter.Quota,
    },
    {
      name: 'Synonym Maps',
      usage: counters.SynonymMapCounter.Usage,
      quota: counters.SynonymMapCounter.Quota,
    },
    {
      name: 'Skillsets',
      usage: counters.SkillsetCounter.Usage,
      quota: counters.SkillsetCounter.Quota,
    },
  ];

  const storageData = [
    {
      name: 'Storage',
      usage: counters.StorageSizeCounter.Usage,
      quota: counters.StorageSizeCounter.Quota,
    },
    {
      name: 'Vector Index',
      usage: counters.VectorIndexSizeCounter.Usage,
      quota: counters.VectorIndexSizeCounter.Quota,
    },
  ];

  return (
    <section className="service-overview">
      <h2>Service Counters</h2>
      <div className="charts-row">
        <div className="chart-container">
          <h3>Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={counterData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : String(value),
                  name === 'usage' ? 'Usage' : 'Quota',
                ]}
              />
              <Bar dataKey="usage" fill="#4f46e5" name="Usage">
                {counterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getUsageColor(entry.usage, entry.quota)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Storage Usage</h3>
          <div className="storage-cards">
            {storageData.map((item) => (
              <StorageCard
                key={item.name}
                name={item.name}
                usage={item.usage}
                quota={item.quota}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="limits-section">
        <h3>Service Limits</h3>
        <div className="limits-grid">
          <LimitItem
            label="Max Fields/Index"
            value={stat.serviceStatistics.Limits.MaxFieldsPerIndex}
          />
          <LimitItem
            label="Max Nesting Depth"
            value={stat.serviceStatistics.Limits.MaxFieldNestingDepthPerIndex}
          />
          <LimitItem
            label="Max Complex Fields"
            value={stat.serviceStatistics.Limits.MaxComplexCollectionFieldsPerIndex}
          />
          <LimitItem
            label="Max Objects in Collections"
            value={stat.serviceStatistics.Limits.MaxComplexObjectsInCollectionsPerDocument}
          />
        </div>
      </div>
    </section>
  );
}

function StorageCard({
  name,
  usage,
  quota,
}: {
  name: string;
  usage: number;
  quota: number | null;
}) {
  const percentage = quota ? (usage / quota) * 100 : 0;

  return (
    <div className="storage-card">
      <h4>{name}</h4>
      <div className="storage-value">{formatBytes(usage)}</div>
      {quota && (
        <>
          <div className="storage-quota">of {formatBytes(quota)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getUsageColor(usage, quota),
              }}
            />
          </div>
          <div className="percentage">{percentage.toFixed(2)}%</div>
        </>
      )}
    </div>
  );
}

function LimitItem({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="limit-item">
      <span className="limit-label">{label}</span>
      <span className="limit-value">
        {value !== null ? value.toLocaleString() : 'Unlimited'}
      </span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getUsageColor(usage: number, quota: number | null): string {
  if (!quota) return '#4f46e5';
  const percentage = (usage / quota) * 100;
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#22c55e';
}
