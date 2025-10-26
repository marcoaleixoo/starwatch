import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { SolarTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatPercent, formatWatts } from './format';

type SolarOptions = BaseTerminalDisplayOptions<SolarTerminalData>;

export class SolarTerminalDisplay extends BaseTerminalDisplay<SolarTerminalData> {
  constructor(options: SolarOptions) {
    super(options);
  }

  protected drawContent(activeTabId: string | null, data: SolarTerminalData): void {
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!data.snapshot) {
      drawCenteredMessage(ctx, area, ['PAINEL INATIVO', 'VERIFIQUE OBSTRUÇÕES']);
      return;
    }

    if (activeTabId === 'network') {
      this.drawNetwork(ctx, area, data);
    } else {
      this.drawStatus(ctx, area, data);
    }
  }

  private drawStatus(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: SolarTerminalData): void {
    const { snapshot } = data;
    if (!snapshot) {
      drawCenteredMessage(ctx, area, ['SEM DADOS DISPONÍVEIS']);
      return;
    }
    const rows: MetricRow[] = [
      { label: 'SAÍDA ATUAL', value: formatWatts(snapshot.outputW), variant: 'accent' },
      { label: 'SOMBREAMENTO', value: formatPercent(snapshot.shade) },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawNetwork(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: SolarTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM REDE']);
      return;
    }
    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'GERAÇÃO TOTAL', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'Δ', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }
}
