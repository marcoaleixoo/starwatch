import type { ChunkGenerationContext } from './types';
import { generateStartingPlatform } from './platform';
import { generateAsteroidField } from './asteroid-field';

export type ChunkGeneratorStage = (context: ChunkGenerationContext) => void;

const DEFAULT_STAGES: ChunkGeneratorStage[] = [generateStartingPlatform, generateAsteroidField];

export function runGenerationPipeline(
  context: ChunkGenerationContext,
  stages: ChunkGeneratorStage[] = DEFAULT_STAGES,
): void {
  for (const stage of stages) {
    stage(context);
  }
}
