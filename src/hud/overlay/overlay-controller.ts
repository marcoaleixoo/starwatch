export type OverlayModalId = 'dummy' | 'terminal';

export interface OverlayState {
  modal: OverlayModalId | null;
  captureInput: boolean;
}

type Listener = () => void;

export class OverlayController {
  private state: OverlayState = {
    modal: null,
    captureInput: false,
  };

  private listeners = new Set<Listener>();
  private onCaptureChange?: (capture: boolean) => void;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): OverlayState {
    return this.state;
  }

  registerCaptureHandler(handler: (capture: boolean) => void): void {
    this.onCaptureChange = handler;
    handler(this.state.captureInput);
  }

  toggleModal(modal: OverlayModalId): void {
    if (this.state.modal === modal) {
      this.closeModal();
      return;
    }
    this.openModal(modal);
  }

  openModal(modal: OverlayModalId): void {
    if (this.state.modal === modal && this.state.captureInput) {
      return;
    }
    this.setState({
      modal,
      captureInput: true,
    });
  }

  closeModal(): void {
    if (!this.state.modal && !this.state.captureInput) {
      return;
    }
    this.setState({
      modal: null,
      captureInput: false,
    });
  }

  reset(): void {
    this.setState({
      modal: null,
      captureInput: false,
    });
    this.listeners.clear();
  }

  private setState(nextState: OverlayState): void {
    const changedModal = this.state.modal !== nextState.modal;
    const changedCapture = this.state.captureInput !== nextState.captureInput;

    this.state = nextState;

    if (changedCapture && this.onCaptureChange) {
      this.onCaptureChange(this.state.captureInput);
    }

    if (changedModal || changedCapture) {
      this.emit();
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
