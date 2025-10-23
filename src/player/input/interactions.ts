import { Engine } from 'noa-engine';
import type { BlockMutation } from '../../persistence/manager';

type BlockResolver = () => number;

const INPUT_ACTION_FIRE = 'fire';
const INPUT_ACTION_ALT_FIRE = 'alt-fire';
const INPUT_ACTION_JUMP = 'jump';

const ALT_FIRE_BINDINGS = ['Mouse2', 'KeyE'];
const JUMP_BINDINGS = ['Space'];

export type BlockMutationHandler = (mutation: BlockMutation) => void;

export function initializeInteractions(
  noa: Engine,
  resolveBlockId: BlockResolver,
  onBlockMutation?: BlockMutationHandler,
  _setSelection?: (index: number) => void,
) {
  noa.inputs.down.on(INPUT_ACTION_FIRE, () => {
    if (!noa.targetedBlock) return;
    const [x, y, z] = noa.targetedBlock.position;
    noa.setBlock(0, x, y, z);
    onBlockMutation?.({
      position: [x, y, z],
      type: 0,
    });
  });

  noa.inputs.down.on(INPUT_ACTION_ALT_FIRE, () => {
    if (!noa.targetedBlock) return;
    const [x, y, z] = noa.targetedBlock.adjacent;
    const blockId = resolveBlockId();
    noa.setBlock(blockId, x, y, z);
    onBlockMutation?.({
      position: [x, y, z],
      type: blockId,
    });
  });

  noa.inputs.bind(INPUT_ACTION_ALT_FIRE, ALT_FIRE_BINDINGS);
  noa.inputs.bind(INPUT_ACTION_JUMP, JUMP_BINDINGS);
}
