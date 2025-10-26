import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { HalTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatMegajoules, formatWatts } from './format';
import { orientationToNormal, orientationToYaw } from './helpers';

type HalOptions = BaseTerminalDisplayOptions<HalTerminalData>;

export class HalTerminalDisplay extends BaseTerminalDisplay<HalTerminalData> {
  constructor(options: HalOptions) {
    super(options);
    this.createColumn(options);
  }

  protected drawContent(activeTabId: string | null, data: HalTerminalData): void {
    const { overview } = data;
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM REDE CONECTADA', 'APROXIME UM DECK CONDUTIVO']);
      return;
    }

    switch (activeTabId) {
      case 'overview':
        this.drawOverview(ctx, area, data);
        break;
      case 'power':
        this.drawPower(ctx, area, data);
        break;
      case 'devices':
      default:
        this.drawDevices(ctx, area, data);
        break;
    }
  }

  private drawOverview(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: HalTerminalData): void {
    const { overview, terminal } = data;
    if (!overview || !terminal) {
      drawCenteredMessage(ctx, area, ['HAL-9001', 'AGUARDANDO SINAL']);
      return;
    }

    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'Δ ATUAL', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
      { label: 'GERAÇÃO', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'ARMAZENADO', value: formatMegajoules(overview.metrics.totalStoredMJ) },
      { label: 'CAPACIDADE', value: formatMegajoules(overview.metrics.totalCapMJ) },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawPower(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: HalTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM MÉTRICAS DISPONÍVEIS']);
      return;
    }

    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'RESERVA TOTAL', value: formatMegajoules(overview.metrics.totalStoredMJ) },
      { label: 'CAP MÁXIMA', value: formatMegajoules(overview.metrics.totalCapMJ) },
      { label: 'GERAÇÃO INSTANTÂNEA', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO INSTANTÂNEO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'SALDO', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawDevices(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: HalTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['NENHUM DISPOSITIVO ENCONTRADO']);
      return;
    }
    const rows: MetricRow[] = [
      { label: 'PAINÉIS SOLARES', value: overview.panelCount.toString() },
      { label: 'BATERIAS', value: overview.batteryCount.toString() },
      { label: 'TERMINAIS', value: overview.terminalCount.toString() },
    ];
    drawMetricList(ctx, area, rows);
  }

  private createColumn(options: HalOptions): void {
    const scene = options.scene;
    const column = MeshBuilder.CreateBox(
      `hal-terminal-column-${options.position.join(':')}`,
      {
        width: 0.7,
        depth: 0.7,
        height: 2,
      },
      scene,
    );
    column.isPickable = false;
    column.position = new Vector3(options.position[0] + 0.5, options.position[1] + 1, options.position[2] + 0.5);
    column.renderingGroupId = 1;
    const columnMat = new StandardMaterial(`hal-terminal-column-mat-${options.position.join(':')}`, scene);
    columnMat.diffuseColor = new Color3(0.1, 0.17, 0.28);
    columnMat.emissiveColor = new Color3(0.02, 0.05, 0.12);
    column.material = columnMat;
    this.addDecoration(column);

    const bezel = MeshBuilder.CreateBox(
      `hal-terminal-bezel-${options.position.join(':')}`,
      {
        width: options.physicalWidth + 0.12,
        height: options.physicalHeight + 0.12,
        depth: 0.08,
      },
      scene,
    );
    bezel.isPickable = false;
    const normal = orientationToNormal(options.orientation);
    const screenPos = new Vector3(options.position[0] + 0.5, options.position[1] + options.elevation, options.position[2] + 0.5);
    bezel.position = screenPos.add(normal.scale(options.mountOffset - 0.04));
    bezel.rotation = new Vector3(0, orientationToYaw(options.orientation), 0);
    bezel.renderingGroupId = 2;
    const bezelMat = new StandardMaterial(`hal-terminal-bezel-mat-${options.position.join(':')}`, scene);
    bezelMat.diffuseColor = new Color3(0.07, 0.12, 0.22);
    bezelMat.emissiveColor = new Color3(0.05, 0.08, 0.16);
    bezelMat.disableLighting = true;
    bezel.material = bezelMat;
    this.addDecoration(bezel);
  }

}
