interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MetricVariant = 'default' | 'positive' | 'negative' | 'muted' | 'accent';

export interface MetricRow {
  label: string;
  value: string;
  variant?: MetricVariant;
}

export function clearContent(ctx: CanvasRenderingContext2D, area: Rect): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.width, area.height);
  ctx.clip();
  ctx.clearRect(area.x, area.y, area.width, area.height);
  ctx.fillStyle = 'rgba(6, 18, 40, 0.7)';
  ctx.fillRect(area.x, area.y, area.width, area.height);
  ctx.restore();
}

export function drawMetricList(ctx: CanvasRenderingContext2D, area: Rect, rows: MetricRow[]): void {
  ctx.save();
  ctx.font = '24px monospace';
  ctx.textBaseline = 'middle';
  const startY = area.y + 28;
  const spacing = 34;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const centerY = startY + i * spacing;
    ctx.fillStyle = variantToColor(row.variant ?? 'default');
    ctx.textAlign = 'left';
    ctx.fillText(row.label.toUpperCase(), area.x + 18, centerY);
    ctx.textAlign = 'right';
    ctx.fillText(row.value, area.x + area.width - 18, centerY);
  }
  ctx.restore();
}

export function drawCenteredMessage(ctx: CanvasRenderingContext2D, area: Rect, lines: string[]): void {
  ctx.save();
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(180, 210, 255, 0.75)';
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;
  const spacing = 32;
  const totalHeight = spacing * (lines.length - 1);
  lines.forEach((line, index) => {
    const offset = -totalHeight / 2 + index * spacing;
    ctx.fillText(line, centerX, centerY + offset);
  });
  ctx.restore();
}

export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  area: Rect,
  value: number,
  options?: { label?: string; color?: string },
): void {
  const clamped = Math.max(0, Math.min(1, value));
  const height = 28;
  const y = area.y + area.height / 2 - height / 2;
  const padding = 18;
  const width = area.width - padding * 2;
  ctx.save();
  ctx.fillStyle = 'rgba(24, 48, 94, 0.9)';
  ctx.fillRect(area.x + padding, y, width, height);
  const activeWidth = Math.max(4, width * clamped);
  ctx.fillStyle = options?.color ?? 'rgba(120, 200, 255, 0.9)';
  ctx.fillRect(area.x + padding, y, activeWidth, height);
  ctx.strokeStyle = 'rgba(180, 220, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(area.x + padding, y, width, height);
  if (options?.label) {
    ctx.font = '22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#06112a';
    ctx.fillText(options.label, area.x + padding + width / 2, y + height / 2);
  }
  ctx.restore();
}

function variantToColor(variant: MetricVariant): string {
  switch (variant) {
    case 'positive':
      return '#7ef0c6';
    case 'negative':
      return '#ff7b7b';
    case 'muted':
      return 'rgba(160, 200, 255, 0.55)';
    case 'accent':
      return 'rgba(225, 245, 255, 0.95)';
    case 'default':
    default:
      return 'rgba(200, 225, 255, 0.85)';
  }
}

