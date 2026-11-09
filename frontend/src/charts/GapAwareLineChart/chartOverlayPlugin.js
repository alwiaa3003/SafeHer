import { CHART_COLORS, CHART_FONT } from './chartTheme';

const NOTE_GAP = 8;
const NOTE_ROW_HEIGHT = 15;

function drawText(ctx, text, x, y, { align = 'center', color = CHART_COLORS.muted, weight = '400' } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${CHART_FONT.size}px ${CHART_FONT.family}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function columnWidth(scale) {
  return scale.getPixelForValue(1) - scale.getPixelForValue(0);
}

// Draws what Chart.js has no built-in concept of: a labelled band for missing
// periods, short notes on specific years, and the latest value at the line's end.
export const chartOverlayPlugin = {
  id: 'chartOverlay',

  beforeDatasetsDraw(chart, _args, options) {
    const { ctx, chartArea, scales } = chart;
    const values = chart.data.datasets[0].data;
    const width = columnWidth(scales.x);

    ctx.save();
    values.forEach((value, index) => {
      if (value !== null) return;
      const left = scales.x.getPixelForValue(index) - width / 2;
      ctx.fillStyle = CHART_COLORS.page;
      ctx.fillRect(left, chartArea.top, width, chartArea.bottom - chartArea.top);
      const middle = (chartArea.top + chartArea.bottom) / 2;
      const x = left + width / 2;
      options.gapText.forEach((line, i) => {
        const offset = (i - (options.gapText.length - 1) / 2) * 16;
        drawText(ctx, line, x, middle + offset);
      });
    });
    ctx.restore();
  },

  afterDatasetsDraw(chart, _args, options) {
    const { ctx, chartArea, scales, tooltip } = chart;
    const values = chart.data.datasets[0].data;

    ctx.save();
    // A note that would run into the one before it drops to the next row.
    ctx.font = `400 ${CHART_FONT.size}px ${CHART_FONT.family}`;
    let previous = null;
    options.notes.forEach(({ index, text, align }) => {
      const x = scales.x.getPixelForValue(index);
      const width = ctx.measureText(text).width;
      const left = align === 'right' ? x - width : x - width / 2;
      const overlaps = previous && left < previous.right + NOTE_GAP;
      const row = overlaps ? previous.row + 1 : 0;
      drawText(ctx, text, x, chartArea.top + 10 + row * NOTE_ROW_HEIGHT, { align });
      previous = { right: left + width, row };
    });

    const lastIndex = values.length - 1;
    if (values[lastIndex] !== null) {
      drawText(
        ctx,
        options.formatValue(values[lastIndex]),
        scales.x.getPixelForValue(lastIndex),
        scales.y.getPixelForValue(values[lastIndex]) - 18,
        { color: CHART_COLORS.ink, weight: '600' },
      );
    }

    // Crosshair for the hovered year.
    const active = tooltip?.getActiveElements?.() ?? [];
    if (active.length > 0) {
      ctx.strokeStyle = CHART_COLORS.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(active[0].element.x, chartArea.top);
      ctx.lineTo(active[0].element.x, chartArea.bottom);
      ctx.stroke();
    }
    ctx.restore();
  },
};
