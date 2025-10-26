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
  private onCaptureChange?: (state: OverlayState) => void;

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

  registerCaptureHandler(handler: (state: OverlayState) => void): void {
    this.onCaptureChange = handler;
    handler(this.state);
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

    if ((changedCapture || changedPointer) && this.onCaptureChange) {
      this.onCaptureChange(this.state);
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
