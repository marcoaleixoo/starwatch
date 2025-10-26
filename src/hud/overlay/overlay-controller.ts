export interface OverlayState {
  captureInput: boolean;
}

type Listener = () => void;

export class OverlayController {
  private state: OverlayState = {
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

  setCapture(capture: boolean): void {
    if (this.state.captureInput === capture) {
      return;
    }
    this.setState({
      captureInput: capture,
    });
  }

  registerCaptureHandler(handler: (capture: boolean) => void): void {
    this.onCaptureChange = handler;
    handler(this.state.captureInput);
  }

  reset(): void {
    this.setState({
      captureInput: false,
    });
    this.listeners.clear();
  }

  private setState(nextState: OverlayState): void {
    const changedCapture = this.state.captureInput !== nextState.captureInput;

    this.state = nextState;

    if (changedCapture && this.onCaptureChange) {
      this.onCaptureChange(this.state.captureInput);
    }

    if (changedCapture) {
      this.emit();
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
