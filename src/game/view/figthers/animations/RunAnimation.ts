import { bindMethods, uint } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';

/** Running `steps` cycles of "run", optionally with the start ("idle2run") and the stop ("run2idle"). */
export class RunAnimation extends FighterAnimation {
  private fighter: any = null;
  private steps: number;
  private withStart: boolean;
  private withFinish: boolean;

  constructor(steps: number, withStart = true, withFinish = true) {
    super(withStart ? 'idle2run' : 'run');
    this.steps = uint(steps);
    this.withFinish = withFinish;
    this.withStart = withStart;
  }
  make(fighterView: any) {
    this.fighter = fighterView;
    super.make(fighterView);
  }
  /** the end of one part: go on with the next one */
  finish(_clip: any) {
    switch (this.name) {
      case 'idle2run':
        this.name = 'run';
        this.make(this.fighter);
        break;
      case 'run':
        --this.steps;
        if (this.steps == 0) {
          if (!this.withFinish) {
            this.realFinish();
            return;
          }
          this.name = 'run2idle';
        }
        this.make(this.fighter);
        break;
      case 'run2idle':
        this.realFinish();
    }
  }
  forceKill(): boolean {
    return true;
  }
  realFinish() {
    super.finish(null);
  }
}
bindMethods(RunAnimation);
