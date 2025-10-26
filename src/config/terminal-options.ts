/** Req: manter thresholds de interação do terminal numa única fonte. */
export interface TerminalInteractionOptions {
  useRange: number;
  proximityRange: number;
  disengageRange: number;
  disengageGraceTicks: number;
}

export const TERMINAL_INTERACTION_OPTIONS: TerminalInteractionOptions = {
  useRange: 3,
  proximityRange: 2.05,
  disengageRange: 2.4,
  disengageGraceTicks: 6,
};
