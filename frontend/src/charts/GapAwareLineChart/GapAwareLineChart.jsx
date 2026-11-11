import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { chartOverlayPlugin } from './chartOverlayPlugin';
import { CHART_COLORS, CHART_FONT } from './chartTheme';
import styles from './GapAwareLineChart.module.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip);

const formatCount = (value) => value.toLocaleString('en-IN');
const formatTick = (value) => (value === 0 ? '0' : `${value / 1000}K`);

// `points` is [{ label, value }]; a null value leaves a true break in the line.
export function GapAwareLineChart({
  points,
  ariaLabel,
  unit,
  yMax,
  yStep,
  gapText,
  notes = [],
  tooltipDetail,
  yTitle,
}) {
  const data = {
    labels: points.map((point) => point.label),
    datasets: [
      {
        label: unit,
        data: points.map((point) => point.value),
        spanGaps: false,
        fill: false,
        tension: 0,
        borderColor: CHART_COLORS.line,
        borderWidth: 2,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        pointBackgroundColor: CHART_COLORS.line,
        pointBorderColor: CHART_COLORS.surface,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHitRadius: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { top: 8 } },
    scales: {
      x: {
        offset: true,
        grid: { display: false },
        border: { color: CHART_COLORS.axis },
        ticks: { color: CHART_COLORS.muted, font: CHART_FONT },
      },
      y: {
        min: 0,
        max: yMax,
        grid: { color: CHART_COLORS.grid, lineWidth: 1 },
        border: { display: false },
        title: yTitle ? { display: true, text: yTitle, color: CHART_COLORS.muted, font: CHART_FONT } : { display: false },
        ticks: {
          color: CHART_COLORS.muted,
          font: CHART_FONT,
          stepSize: yStep,
          callback: formatTick,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.ink,
        titleFont: { ...CHART_FONT, weight: '600' },
        bodyFont: CHART_FONT,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (item) => `${formatCount(item.parsed.y)} ${unit}`,
          afterLabel: (item) => tooltipDetail?.(item.dataIndex) ?? '',
        },
      },
      chartOverlay: { gapText, notes, formatValue: formatCount },
    },
  };

  return (
    <div className={styles.frame}>
      <Line
        data={data}
        options={options}
        plugins={[chartOverlayPlugin]}
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
}
