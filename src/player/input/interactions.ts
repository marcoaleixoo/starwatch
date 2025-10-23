import { Engine } from 'noa-engine';

type BlockResolver = () => number;

const INPUT_ACTION_FIRE = 'fire';
const INPUT_ACTION_ALT_FIRE = 'alt-fire';
const INPUT_ACTION_JUMP = 'jump';

const ALT_FIRE_BINDINGS = ['Mouse2', 'KeyE'];
const JUMP_BINDINGS = ['Space'];

export function initializeInteractions(
  noa: Engine,
  resolveBlockId: BlockResolver,
  _setSelection?: (index: number) => void,
) {
  noa.inputs.down.on(INPUT_ACTION_FIRE, () => {
    if (!noa.targetedBlock) return;
    const [x, y, z] = noa.targetedBlock.position;
    noa.setBlock(0, x, y, z);
  });

  noa.inputs.down.on(INPUT_ACTION_ALT_FIRE, () => {
    if (!noa.targetedBlock) return;
    const [x, y, z] = noa.targetedBlock.adjacent;
    noa.setBlock(resolveBlockId(), x, y, z);
  });

  noa.inputs.bind(INPUT_ACTION_ALT_FIRE, ALT_FIRE_BINDINGS);
  noa.inputs.bind(INPUT_ACTION_JUMP, JUMP_BINDINGS);
}
