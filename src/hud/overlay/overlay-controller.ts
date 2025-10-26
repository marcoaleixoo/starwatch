export interface OverlayState {
  captureInput: boolean;
  pointerPassthrough: boolean;
}

type Listener = () => void;

export class OverlayController {
  private state: OverlayState = {
    captureInput: false,
    pointerPassthrough: false,
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

  setCapture(capture: boolean): void {
    if (this.state.captureInput === capture) {
      return;
    }
    this.setState({
      captureInput: capture,
      pointerPassthrough: this.state.pointerPassthrough,
    });
  }

  registerCaptureHandler(handler: (capture: boolean) => void): void {
    this.onCaptureChange = handler;
    handler(this.state.captureInput);
  }

  setPointerPassthrough(pointerPassthrough: boolean): void {
    if (this.state.pointerPassthrough === pointerPassthrough) {
      return;
    }
    this.setState({
      captureInput: this.state.captureInput,
      pointerPassthrough,
    });
  }

  reset(): void {
    this.setState({
      captureInput: false,
      pointerPassthrough: false,
    });
    this.listeners.clear();
  }

  private setState(nextState: OverlayState): void {
    const changedCapture = this.state.captureInput !== nextState.captureInput;
    const changedPointer = this.state.pointerPassthrough !== nextState.pointerPassthrough;

    this.state = nextState;

    if (changedCapture && this.onCaptureChange) {
      this.onCaptureChange(this.state.captureInput);
    }

    if (changedCapture || changedPointer) {
      this.emit();
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
