/** A state of an FSM. */
export interface State {
  enter(): void;
  leave(): void;
  addTransition(target: State, transition: string): void;
  getName(): string;
  getTargetForTransition(transition: string): State;
  clear(): void;
}
