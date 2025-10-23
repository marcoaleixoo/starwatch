import { Engine } from 'noa-engine';

export function initializePointerLock(noa: Engine) {
  const canvas = noa.container?.canvas;

  if (canvas) {
    canvas.addEventListener('click', () => {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    });
  }

  window.addEventListener('blur', () => {
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (error) {
        // ignore
      }
    }
  });
}
