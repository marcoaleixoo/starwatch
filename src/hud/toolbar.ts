import type { BlockPaletteEntry } from '../world/world';
import { KEY_PREFIX_DIGIT, TOOLBAR_SLOT_CLASS } from './constants';

type SelectCallback = (index: number) => void;

declare global {
  interface HTMLElementEventMap {
    selectpalette: CustomEvent<number>;
  }
}

export interface ToolbarController {
  render(selectedIndex: number): void;
}

export function initializeToolbar(
  palette: BlockPaletteEntry[],
  onSelect: SelectCallback,
): ToolbarController {
  const toolbarEl = document.getElementById('toolbar');
  const buttons: HTMLButtonElement[] = [];

  if (!toolbarEl) {
    return {
      render() {
        /* noop */
      },
    };
  }

  toolbarEl.innerHTML = '';

  palette.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = TOOLBAR_SLOT_CLASS;
    button.dataset.index = String(index);
    button.innerHTML = `<sup>${entry.hotkey}</sup>${entry.label}`;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      onSelect(index);
    });
    toolbarEl.appendChild(button);
    buttons.push(button);
  });

  window.addEventListener('keydown', (event) => {
    if (!event.code.startsWith(KEY_PREFIX_DIGIT)) return;
    const digit = Number.parseInt(event.code.replace(KEY_PREFIX_DIGIT, ''), 10);
    if (Number.isNaN(digit)) return;
    const targetIndex = palette.findIndex((entry) => entry.hotkey === String(digit));
    if (targetIndex >= 0) {
      onSelect(targetIndex);
    }
  });

  return {
    render(selectedIndex: number) {
      buttons.forEach((button, index) => {
        button.classList.toggle('is-active', index === selectedIndex);
      });
    },
  };
}
