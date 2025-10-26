import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { VoxelPosition } from '../energy/energy-network-manager';
import type { BlockOrientation } from '../../blocks/types';
import { orientationToNormal } from './helpers';
import type {
  TerminalDisplayKind,
  TerminalPointerEvent,
  TerminalTab,
} from './types';

const BORDER = 32;
const HEADER_HEIGHT = 64;
const TAB_BAR_HEIGHT = 80;
const FOOTER_HEIGHT = 64;

export interface BaseTerminalDisplayOptions<TData> {
  scene: Scene;
  position: VoxelPosition;
  orientation: BlockOrientation;
  kind: TerminalDisplayKind;
  physicalWidth: number;
  physicalHeight: number;
  textureWidth: number;
  textureHeight: number;
  elevation: number;
  mountOffset: number;
  title: string;
  accentColor: string;
  dataProvider: () => TData;
  tabs: TerminalTab[];
}

interface TabRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class BaseTerminalDisplay<TData> {
  readonly kind: TerminalDisplayKind;
  readonly position: VoxelPosition;

  protected readonly dataProvider: () => TData;
  protected readonly tabs: TerminalTab[];
  protected readonly scene: Scene;
  protected readonly orientation: BlockOrientation;
  protected readonly textureWidth: number;
  protected readonly textureHeight: number;
  protected readonly accentColor: string;
  protected readonly title: string;
  protected readonly mesh: Mesh;
  protected readonly texture: DynamicTexture;
  protected readonly ctx: CanvasRenderingContext2D;
  protected readonly contentArea: { x: number; y: number; width: number; height: number };

  private readonly material: StandardMaterial;
  private readonly tabRects: TabRect[] = [];
  private readonly decorations: Mesh[] = [];
  private readonly allMeshes: Mesh[] = [];

  private sessionActive = false;
  private hoverTabIndex: number | null = null;
  private activeTabIndex = 0;

  constructor(options: BaseTerminalDisplayOptions<TData>) {
    this.scene = options.scene;
    this.kind = options.kind;
    this.position = options.position;
    this.orientation = options.orientation;
    this.dataProvider = options.dataProvider;
    this.tabs = options.tabs;
    this.textureWidth = options.textureWidth;
    this.textureHeight = options.textureHeight;
    this.accentColor = options.accentColor;
    this.title = options.title;

    this.mesh = MeshBuilder.CreatePlane(
      `terminal-screen-${options.position.join(':')}`,
      {
        width: options.physicalWidth,
        height: options.physicalHeight,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      this.scene,
    );
    this.mesh.alwaysSelectAsActiveMesh = true;
    this.mesh.isPickable = true;
    this.mesh.metadata = { terminalScreen: true, key: this.makeKey() };
    this.allMeshes.push(this.mesh);

    const yaw = orientationToYaw(options.orientation);
    const normal = orientationToNormal(options.orientation);
    const base = new Vector3(
      options.position[0] + 0.5,
      options.position[1] + options.elevation,
      options.position[2] + 0.5,
    );
    const offset = normal.scale(options.mountOffset);
    this.mesh.position = base.add(offset);
    this.mesh.rotation = new Vector3(0, yaw, 0);

    this.texture = new DynamicTexture(
      `terminal-texture-${options.position.join(':')}`,
      { width: options.textureWidth, height: options.textureHeight },
      this.scene,
      false,
    );
    this.texture.hasAlpha = true;
    const context = this.texture.getContext() as CanvasRenderingContext2D;
    context.imageSmoothingEnabled = false;
    this.ctx = context;

    this.material = new StandardMaterial(`terminal-material-${options.position.join(':')}`, this.scene);
    this.material.diffuseColor = Color3.White();
    this.material.emissiveColor = new Color3(0.85, 0.9, 1);
    this.material.specularColor = Color3.Black();
    this.material.backFaceCulling = false;
    this.material.disableLighting = true;
    this.material.diffuseTexture = this.texture;
    this.material.emissiveTexture = this.texture;
    this.mesh.material = this.material;
    this.mesh.renderingGroupId = 2;

    this.contentArea = {
      x: BORDER,
      y: BORDER + HEADER_HEIGHT + TAB_BAR_HEIGHT,
      width: this.textureWidth - BORDER * 2,
      height: this.textureHeight - BORDER * 2 - HEADER_HEIGHT - TAB_BAR_HEIGHT - FOOTER_HEIGHT,
    };

    this.refresh();
  }

  dispose(): void {
    this.mesh.dispose(false, true);
    this.texture.dispose();
    for (const mesh of this.decorations) {
      mesh.dispose(false, true);
    }
  }

  getMesh(): Mesh {
    return this.mesh;
  }

  protected addDecoration(mesh: Mesh): void {
    this.decorations.push(mesh);
    this.allMeshes.push(mesh);
  }

  getMeshes(): Mesh[] {
    return this.allMeshes;
  }

  refresh(): void {
    const data = this.dataProvider();
    this.drawBase();
    this.drawHeader();
    this.drawTabs();
    this.drawContent(this.tabs[this.activeTabIndex]?.id ?? null, data);
    this.drawFooter();
    this.texture.update();
  }

  setSessionActive(active: boolean): void {
    if (this.sessionActive === active) {
      return;
    }
    this.sessionActive = active;
    this.refresh();
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowRight') {
      this.shiftTab(1);
      return true;
    }
    if (event.key === 'ArrowLeft') {
      this.shiftTab(-1);
      return true;
    }
    return this.onKeyDown(event);
  }

  handlePointer(event: TerminalPointerEvent): boolean {
    const tabIndex = this.pickTab(event);
    if (tabIndex !== null) {
      this.setActiveTab(tabIndex);
      return true;
    }
    return this.onPointer(event);
  }

  protected onPointer(_event: TerminalPointerEvent): boolean {
    return false;
  }

  protected onKeyDown(_event: KeyboardEvent): boolean {
    return false;
  }

  protected abstract drawContent(activeTabId: string | null, data: TData): void;

  protected setActiveTab(index: number): void {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }
    if (this.activeTabIndex === index) {
      return;
    }
    this.activeTabIndex = index;
    this.refresh();
  }

  private makeKey(): string {
    return `${this.kind}:${this.position.join(':')}`;
  }

  private shiftTab(delta: number): void {
    if (this.tabs.length === 0) {
      return;
    }
    const next = (this.activeTabIndex + delta + this.tabs.length) % this.tabs.length;
    this.setActiveTab(next);
  }

  private pickTab(event: TerminalPointerEvent): number | null {
    if (this.tabRects.length === 0) {
      return null;
    }
    const x = event.uv.u * this.textureWidth;
    const y = (1 - event.uv.v) * this.textureHeight;
    for (let i = 0; i < this.tabRects.length; i += 1) {
      const rect = this.tabRects[i];
      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        this.hoverTabIndex = i;
        return i;
      }
    }
    this.hoverTabIndex = null;
    return null;
  }

  private drawBase(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.textureWidth, this.textureHeight);
    ctx.fillStyle = '#050f2a';
    ctx.fillRect(0, 0, this.textureWidth, this.textureHeight);

    const innerX = BORDER;
    const innerY = BORDER;
    const innerW = this.textureWidth - BORDER * 2;
    const innerH = this.textureHeight - BORDER * 2;

    const gradient = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    gradient.addColorStop(0, this.sessionActive ? 'rgba(40, 110, 230, 0.25)' : 'rgba(30, 80, 180, 0.18)');
    gradient.addColorStop(1, 'rgba(12, 30, 64, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(innerX, innerY, innerW, innerH);

    ctx.strokeStyle = this.sessionActive ? 'rgba(140, 200, 255, 0.95)' : 'rgba(90, 140, 220, 0.75)';
    ctx.lineWidth = 6;
    ctx.strokeRect(innerX, innerY, innerW, innerH);

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#5a7bcf';
    for (let y = innerY; y < innerY + innerH; y += 4) {
      ctx.fillRect(innerX, y, innerW, 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawHeader(): void {
    const ctx = this.ctx;
    const headerY = BORDER + 42;
    ctx.save();
    ctx.font = '32px monospace';
    ctx.fillStyle = 'rgba(185, 216, 255, 0.9)';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.title.toUpperCase(), BORDER + 8, headerY);
    ctx.font = '20px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = this.sessionActive ? 'rgba(144, 220, 255, 0.9)' : 'rgba(120, 160, 220, 0.7)';
    ctx.fillText(this.sessionActive ? 'SESSION ONLINE' : 'STANDBY', this.textureWidth - BORDER - 8, headerY);
    ctx.restore();
  }

  private drawTabs(): void {
    const ctx = this.ctx;
    const tabCount = this.tabs.length;
    const originX = BORDER + 8;
    const top = BORDER + HEADER_HEIGHT + 12;
    const height = TAB_BAR_HEIGHT - 24;
    const spacing = 14;
    const available = this.textureWidth - BORDER * 2 - 16;
    const tabWidth = tabCount > 0 ? (available - (tabCount - 1) * spacing) / tabCount : available;

    this.tabRects.length = 0;

    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.font = '24px monospace';

    for (let i = 0; i < tabCount; i += 1) {
      const tab = this.tabs[i];
      const x = originX + i * (tabWidth + spacing);
      const isActive = i === this.activeTabIndex;
      const isHover = i === this.hoverTabIndex;
      const baseColor = isActive
        ? this.accentColor
        : isHover
          ? 'rgba(70, 120, 220, 0.6)'
          : 'rgba(40, 70, 110, 0.55)';
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, top, tabWidth, height);

      ctx.strokeStyle = isActive ? 'rgba(180, 230, 255, 0.8)' : 'rgba(80, 120, 190, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, top, tabWidth, height);

      ctx.fillStyle = isActive ? '#06112a' : 'rgba(200, 220, 255, 0.82)';
      ctx.textAlign = 'center';
      ctx.fillText(tab.label.toUpperCase(), x + tabWidth / 2, top + height / 2);

      this.tabRects.push({ x, y: top, width: tabWidth, height });
    }
    ctx.restore();
  }

  private drawFooter(): void {
    const ctx = this.ctx;
    const baseY = this.textureHeight - BORDER - FOOTER_HEIGHT / 2;
    ctx.save();
    ctx.font = '20px monospace';
    ctx.fillStyle = 'rgba(130, 170, 240, 0.75)';
    ctx.textBaseline = 'middle';
    ctx.fillText('[ESC] SAIR', BORDER + 8, baseY);
    ctx.textAlign = 'center';
    ctx.fillText('← → TABS', this.textureWidth / 2, baseY);
    ctx.textAlign = 'right';
    ctx.fillText('CLIQUE PARA SELECIONAR', this.textureWidth - BORDER - 8, baseY);
    ctx.restore();
  }
}
