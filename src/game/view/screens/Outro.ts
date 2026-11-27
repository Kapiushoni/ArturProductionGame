import { Dictionary, bindMethods } from '@/flash/as3';
import { ComicWindow } from '@/game/view/screens/ComicWindow';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class Outro extends ComicWindow {
  constructor() {
    super(main.swfLoader.getClass('assets.Outro'), 5);
  }
  initializeText() {
    this.bg.box_1.text.text = main.locale.get('outro_01');
    this.bg.box_2.text.text = main.locale.get('outro_02');
    this.bg.box_3.text.text = main.locale.get('outro_03');
    this.bg.box_4.text.text = main.locale.get('outro_04');
    this.bg.box_5.text.text = main.locale.get('outro_05');
    this.bg.box_6.text.text = main.locale.get('outro_06');
  }
  getButtonInfo() {
    var dict = new Dictionary();
    dict.set('ok', ButtonGroup.get('gui').createButton(this.next, 'mouseOver', 'mouseOut'));
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    return dict;
  }
  get music() {
    return GameSounds.WIN_MUSIC;
  }
}
bindMethods(Outro);
