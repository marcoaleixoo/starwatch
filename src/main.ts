import './styles.css';
import { bootstrapStarwatch } from './core/bootstrap';

const context = bootstrapStarwatch();

declare global {
  interface Window {
    starwatch?: typeof context;
  }
}

window.starwatch = context;
