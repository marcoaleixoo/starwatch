export const HOTBAR_SLOT_COUNT = 9;

export interface HotbarItemDefinition {
  id: string;
  label: string;
  description: string;
  icon: 'deck' | 'solar-panel' | 'battery' | 'terminal';
  blockKind: string;
}

export const INITIAL_HOTBAR_ITEMS: HotbarItemDefinition[] = [
  {
    id: 'deck',
    label: 'Deck Condutivo',
    description: 'Chão estruturante e condutor da rede elétrica.',
    icon: 'deck',
    blockKind: 'starwatch:deck',
  },
  {
    id: 'solar-panel',
    label: 'Painel Solar',
    description: 'Gera energia baseada em iluminação solar.',
    icon: 'solar-panel',
    blockKind: 'starwatch:solar-panel',
  },
  {
    id: 'battery',
    label: 'Bateria 5 MJ',
    description: 'Armazena energia excedente da rede.',
    icon: 'battery',
    blockKind: 'starwatch:battery',
  },
  {
    id: 'hal-terminal',
    label: 'Terminal HAL',
    description: 'Console interativo HAL com CRT azul.',
    icon: 'terminal',
    blockKind: 'starwatch:hal-terminal',
  },
];
