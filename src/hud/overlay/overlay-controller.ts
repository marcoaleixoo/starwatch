export type OverlayModalState =
  | { id: 'dummy' }
  | { id: 'terminal'; position: [number, number, number] };

export interface OverlayState {
  modal: OverlayModalState | null;
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

  toggleModal(modal: OverlayModalState): void {
    if (this.state.modal?.id === modal.id) {
      this.closeModal();
      return;
    }
    this.openModal(modal);
  }

  openModal(modal: OverlayModalState): void {
    if (this.state.modal?.id === modal.id && this.state.captureInput) {
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
