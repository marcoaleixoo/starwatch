import { useOverlayContext } from '../overlay-context';

export function DummyPanel(): JSX.Element {
  const { controller } = useOverlayContext();
  return (
    <section className="dummy-panel" role="dialog" aria-modal="true">
      <header>
        <h1>Interface Experimental</h1>
      </header>
      <p>Esta é uma janela placeholder para validar o overlay React.</p>
      <p>Pressione Alt + T para fechar.</p>
      <button type="button" onClick={() => controller.closeModal()}>
        Fechar
      </button>
    </section>
  );
}
