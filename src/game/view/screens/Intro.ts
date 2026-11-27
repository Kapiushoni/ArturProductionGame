import { ComicWindow } from '@/game/view/screens/ComicWindow';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';

export class Intro extends ComicWindow {
  constructor() {
    super(app.swfLoader.getClass('assets.Intro'), 4);
  }
  initializeText() {
    this.bg.box_1.title.title.text = app.locale.get('intro_01');
    this.bg.box_2.title.title.text = app.locale.get('intro_02');
    this.bg.box_3.title.title.text = app.locale.get('intro_03');
    this.bg.box_4.title.title.text = app.locale.get('intro_04');
    this.bg.box_6.title.title.text = app.locale.get('intro_06');
    this.bg.box_7.title.title.text = app.locale.get('intro_07');
  }
  get music() {
    return GameSounds.INTRO_MUSIC;
  }
}
