import './styles.css';
import { bootstrapStarwatch } from './game/core/bootstrap';

type BootstrapResult = ReturnType<typeof bootstrapStarwatch>;

declare global {
  interface Window {
    starwatch?: BootstrapResult;
  }
}

const context = bootstrapStarwatch();
window.starwatch = context;

console.log('[starwatch] bootstrap concluído');
