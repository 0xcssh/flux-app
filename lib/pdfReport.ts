import * as Print from 'expo-print';
import type { DailyLogEntry, MetricKey } from '@/types/log';

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'energy', label: 'Energy' },
  { key: 'mood', label: 'Mood' },
  { key: 'libido', label: 'Libido' },
  { key: 'sleep_quality', label: 'Sleep Quality' },
  { key: 'stress', label: 'Stress' },
  { key: 'training', label: 'Training' },
];

function avgMetric(logs: DailyLogEntry[], key: MetricKey): string {
  if (logs.length === 0) return '—';
  const sum = logs.reduce((s, l) => s + l[key], 0);
  return (sum / logs.length).toFixed(1);
}

function avgVitality(logs: DailyLogEntry[]): string {
  if (logs.length === 0) return '—';
  const sum = logs.reduce((s, l) => s + l.vitality_score, 0);
  return Math.round(sum / logs.length).toString();
}

function generateBarChartHTML(logs: DailyLogEntry[]): string {
  if (logs.length === 0) return '<p>No data available.</p>';

  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const maxScore = 100;

  const bars = sorted
    .map((log) => {
      const heightPct = (log.vitality_score / maxScore) * 100;
      const color = log.vitality_score >= 70 ? '#10B981' : log.vitality_score >= 40 ? '#F59E0B' : '#EF4444';
      const dateLabel = log.log_date.slice(5); // MM-DD
      return `
        <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:20px;max-width:40px;">
          <div style="width:100%;background:${color};height:${heightPct}px;border-radius:3px 3px 0 0;min-height:2px;"></div>
          <span style="font-size:8px;color:#64748B;margin-top:4px;transform:rotate(-45deg);white-space:nowrap;">${dateLabel}</span>
        </div>
      `;
    })
    .join('');

  return `
    <div style="display:flex;align-items:flex-end;gap:2px;height:120px;padding:0 4px;margin-top:12px;">
      ${bars}
    </div>
  `;
}

/**
 * Generate a monthly PDF report and return the file URI.
 */
export async function generateMonthlyReport(
  logs: DailyLogEntry[],
  userName: string,
  dateRange: { start: string; end: string },
): Promise<string> {
  const sortedLogs = [...logs]
    .filter((l) => l.log_date >= dateRange.start && l.log_date <= dateRange.end)
    .sort((a, b) => a.log_date.localeCompare(b.log_date));

  const avgVit = avgVitality(sortedLogs);
  const metricRows = METRICS.map(
    (m) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-weight:500;">${m.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${avgMetric(sortedLogs, m.key)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">/10</td>
      </tr>
    `,
  ).join('');

  const barChart = generateBarChartHTML(sortedLogs);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0F172A;
          padding: 40px;
          margin: 0;
          background: #FFFFFF;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #2563EB;
          padding-bottom: 16px;
          margin-bottom: 32px;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          color: #2563EB;
          letter-spacing: -0.5px;
        }
        .logo span { color: #10B981; }
        .meta { text-align: right; color: #64748B; font-size: 13px; }
        .vitality-section {
          text-align: center;
          margin: 32px 0;
          padding: 24px;
          background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%);
          border-radius: 16px;
        }
        .vitality-score {
          font-size: 72px;
          font-weight: 800;
          color: #2563EB;
          line-height: 1;
        }
        .vitality-label {
          font-size: 16px;
          color: #64748B;
          margin-top: 8px;
        }
        h2 {
          color: #0F172A;
          font-size: 18px;
          margin-top: 32px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E2E8F0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background: #F8FAFC;
          padding: 10px 12px;
          text-align: left;
          font-size: 13px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .chart-section { margin: 24px 0; }
        .footer {
          margin-top: 48px;
          padding-top: 16px;
          border-top: 1px solid #E2E8F0;
          font-size: 11px;
          color: #94A3B8;
          text-align: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .stat-card {
          background: #F8FAFC;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .stat-value { font-size: 24px; font-weight: 700; color: #2563EB; }
        .stat-label { font-size: 12px; color: #64748B; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Flux<span>.</span></div>
        <div class="meta">
          <div><strong>${userName || 'User'}</strong></div>
          <div>${dateRange.start} — ${dateRange.end}</div>
          <div>Generated ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="vitality-section">
        <div class="vitality-score">${avgVit}</div>
        <div class="vitality-label">Average Vitality Score</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${sortedLogs.length}</div>
          <div class="stat-label">Days Logged</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgMetric(sortedLogs, 'energy')}</div>
          <div class="stat-label">Avg Energy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgMetric(sortedLogs, 'sleep_quality')}</div>
          <div class="stat-label">Avg Sleep</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgMetric(sortedLogs, 'stress')}</div>
          <div class="stat-label">Avg Stress</div>
        </div>
      </div>

      <h2>Metric Averages</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th style="text-align:center;">Average</th>
            <th style="text-align:center;">Scale</th>
          </tr>
        </thead>
        <tbody>
          ${metricRows}
        </tbody>
      </table>

      <h2>Vitality Score Trend</h2>
      <div class="chart-section">
        ${barChart}
      </div>

      <div class="footer">
        <p>This report is for informational purposes only and does not constitute medical advice.
        Consult a healthcare professional for any health-related decisions.</p>
        <p>Generated by Flux — Track your rhythm. Own your energy.</p>
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}
