export function formatWatts(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const magnitude = Math.abs(value);
  if (magnitude >= 1000) {
    return `${sign}${(magnitude / 1000).toFixed(2)} kW`;
  }
  return `${sign}${magnitude.toFixed(0)} W`;
}

export function formatMegajoules(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2)} GJ`;
  }
  return `${value.toFixed(2)} MJ`;
}

export function formatDelta(deltaW: number): string {
  if (Math.abs(deltaW) < 0.5) {
    return '±0 W';
  }
  return formatWatts(deltaW);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}

