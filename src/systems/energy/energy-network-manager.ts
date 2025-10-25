export type VoxelPosition = [number, number, number];

export interface EnergyNetworkMetrics {
  totalGenW: number;
  totalLoadW: number;
  totalCapMJ: number;
  totalStoredMJ: number;
}

export interface EnergyNetworkSnapshot {
  id: number;
  nodeCount: number;
  metrics: EnergyNetworkMetrics;
}

interface DeckNode {
  key: string;
  position: VoxelPosition;
  neighbors: Set<string>;
  networkId: number;
}

interface EnergyNetwork {
  id: number;
  nodes: Set<string>;
  metrics: EnergyNetworkMetrics;
}

const NEIGHBOR_OFFSETS: ReadonlyArray<VoxelPosition> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function makeKey(position: VoxelPosition): string {
  return `${position[0]}:${position[1]}:${position[2]}`;
}

function clonePosition(position: VoxelPosition): VoxelPosition {
  return [position[0], position[1], position[2]];
}

function createEmptyMetrics(): EnergyNetworkMetrics {
  return {
    totalGenW: 0,
    totalLoadW: 0,
    totalCapMJ: 0,
    totalStoredMJ: 0,
  };
}

function addMetrics(target: EnergyNetworkMetrics, delta: EnergyNetworkMetrics): void {
  target.totalGenW += delta.totalGenW;
  target.totalLoadW += delta.totalLoadW;
  target.totalCapMJ += delta.totalCapMJ;
  target.totalStoredMJ += delta.totalStoredMJ;
}

function subtractMetrics(target: EnergyNetworkMetrics, delta: EnergyNetworkMetrics): void {
  target.totalGenW -= delta.totalGenW;
  target.totalLoadW -= delta.totalLoadW;
  target.totalCapMJ -= delta.totalCapMJ;
  target.totalStoredMJ -= delta.totalStoredMJ;
}

export class EnergyNetworkManager {
  private readonly nodes = new Map<string, DeckNode>();
  private readonly networks = new Map<number, EnergyNetwork>();
  private nextNetworkId = 1;

  getNetworkSnapshot(networkId: number): EnergyNetworkSnapshot | null {
    const network = this.networks.get(networkId);
    if (!network) {
      return null;
    }
    return {
      id: network.id,
      nodeCount: network.nodes.size,
      metrics: { ...network.metrics },
    };
  }

  listNetworks(): EnergyNetworkSnapshot[] {
    return Array.from(this.networks.values()).map((network) => ({
      id: network.id,
      nodeCount: network.nodes.size,
      metrics: { ...network.metrics },
    }));
  }

  getNetworkIdForPosition(position: VoxelPosition): number | null {
    const key = makeKey(position);
    const node = this.nodes.get(key);
    return node ? node.networkId : null;
  }

  addDeck(position: VoxelPosition): number {
    const key = makeKey(position);
    if (this.nodes.has(key)) {
      return this.nodes.get(key)!.networkId;
    }

    const node: DeckNode = {
      key,
      position: clonePosition(position),
      neighbors: new Set(),
      networkId: -1,
    };

    const neighbors = this.getNeighborNodes(position);
    const neighborNetworkIds = new Set<number>();

    for (const neighbor of neighbors) {
      neighbor.neighbors.add(key);
      node.neighbors.add(neighbor.key);
      neighborNetworkIds.add(neighbor.networkId);
    }

    this.nodes.set(key, node);

    let assignedNetworkId: number;
    if (neighborNetworkIds.size === 0) {
      assignedNetworkId = this.createNetworkWithNodes([node]);
    } else {
      const [primaryNetworkId] = neighborNetworkIds;
      assignedNetworkId = primaryNetworkId;
      this.attachNodeToNetwork(node, primaryNetworkId);

      for (const networkId of neighborNetworkIds) {
        if (networkId !== primaryNetworkId) {
          this.mergeNetworks(primaryNetworkId, networkId);
        }
      }
    }

    return assignedNetworkId;
  }

  removeDeck(position: VoxelPosition): void {
    const key = makeKey(position);
    const node = this.nodes.get(key);
    if (!node) {
      return;
    }

    const originalNetworkId = node.networkId;

    for (const neighborKey of node.neighbors) {
      const neighbor = this.nodes.get(neighborKey);
      if (neighbor) {
        neighbor.neighbors.delete(key);
      }
    }

    this.nodes.delete(key);

    const network = this.networks.get(originalNetworkId);
    if (!network) {
      return;
    }

    network.nodes.delete(key);

    if (network.nodes.size === 0) {
      this.networks.delete(originalNetworkId);
      return;
    }

    this.rebuildNetwork(originalNetworkId, network.nodes);
  }

  adjustNetworkMetrics(networkId: number, delta: Partial<EnergyNetworkMetrics>): void {
    const network = this.networks.get(networkId);
    if (!network) {
      return;
    }

    if (typeof delta.totalGenW === 'number') {
      network.metrics.totalGenW += delta.totalGenW;
    }
    if (typeof delta.totalLoadW === 'number') {
      network.metrics.totalLoadW += delta.totalLoadW;
    }
    if (typeof delta.totalCapMJ === 'number') {
      network.metrics.totalCapMJ += delta.totalCapMJ;
    }
    if (typeof delta.totalStoredMJ === 'number') {
      network.metrics.totalStoredMJ += delta.totalStoredMJ;
    }
  }

  private createNetworkWithNodes(nodes: DeckNode[]): number {
    const id = this.nextNetworkId++;
    const network: EnergyNetwork = {
      id,
      nodes: new Set(nodes.map((node) => node.key)),
      metrics: createEmptyMetrics(),
    };
    this.networks.set(id, network);

    for (const node of nodes) {
      node.networkId = id;
    }

    return id;
  }

  private attachNodeToNetwork(node: DeckNode, networkId: number): void {
    const network = this.networks.get(networkId);
    if (!network) {
      throw new Error(`Rede ${networkId} inexistente ao anexar deck.`);
    }
    network.nodes.add(node.key);
    node.networkId = networkId;
  }

  private mergeNetworks(targetNetworkId: number, sourceNetworkId: number): void {
    if (targetNetworkId === sourceNetworkId) {
      return;
    }

    const target = this.networks.get(targetNetworkId);
    const source = this.networks.get(sourceNetworkId);
    if (!target || !source) {
      return;
    }

    for (const key of source.nodes) {
      const node = this.nodes.get(key);
      if (!node) {
        continue;
      }
      node.networkId = targetNetworkId;
      target.nodes.add(key);
    }

    addMetrics(target.metrics, source.metrics);

    this.networks.delete(sourceNetworkId);
  }

  private rebuildNetwork(originalNetworkId: number, remainingKeys: Set<string>): void {
    this.networks.delete(originalNetworkId);

    const remaining = new Set(remainingKeys);
    const visited = new Set<string>();

    const queue: string[] = [];

    const flushComponent = (startKey: string) => {
      queue.length = 0;
      queue.push(startKey);
      visited.add(startKey);

      const componentNodes: DeckNode[] = [];

      while (queue.length > 0) {
        const currentKey = queue.shift()!;
        const node = this.nodes.get(currentKey);
        if (!node) {
          continue;
        }
        componentNodes.push(node);

        for (const neighborKey of node.neighbors) {
          if (!remaining.has(neighborKey) || visited.has(neighborKey)) {
            continue;
          }
          visited.add(neighborKey);
          queue.push(neighborKey);
        }
      }

      if (componentNodes.length > 0) {
        this.createNetworkWithNodes(componentNodes);
      }
    };

    for (const key of remaining) {
      if (visited.has(key)) {
        continue;
      }
      flushComponent(key);
    }
  }

  private getNeighborNodes(position: VoxelPosition): DeckNode[] {
    const neighbors: DeckNode[] = [];
    for (const offset of NEIGHBOR_OFFSETS) {
      const neighborPos: VoxelPosition = [
        position[0] + offset[0],
        position[1] + offset[1],
        position[2] + offset[2],
      ];
      const neighbor = this.nodes.get(makeKey(neighborPos));
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
}
