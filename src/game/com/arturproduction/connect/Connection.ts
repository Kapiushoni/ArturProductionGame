import { LocalConnection, StatusEvent, Timer, bindMethods, int } from '@/flash/as3';

/**
 * A two-way LocalConnection with another Flash movie. The master picks a random number, sends it
 * (every 2 s until the other side answers), and both sides then append it to the connection names.
 * Method calls received are made on uniqueClient.
 */
export class Connection {
  _rLC: any = new LocalConnection();
  _sLC: any = new LocalConnection();
  _rConnection: string = null;
  _sConnection: string = null;
  _connected = false;
  _connectTimer: Timer = null;
  _unique: any = null;
  _uniqueClient: any = null;
  _master = false;

  constructor(receiveName: string, sendName: string, uniqueClient: any, master: boolean) {
    this._rConnection = receiveName;
    this._sConnection = sendName;
    this._uniqueClient = uniqueClient;
    this._master = master;
    if (this._master) {
      this._unique = Math.floor(Math.random() * 10000);
      this._rConnection += this._unique;
      this.initConnection();
    }
    this._rLC.connect(this._rConnection);
    this._rLC.client = this;
  }
  initConnection() {
    this._connectTimer = new Timer(2000);
    this._connectTimer.addEventListener('timer', this.AttemptConnection);
    this._sLC.addEventListener(StatusEvent.STATUS, this.onConnectionStatus);
    this.AttemptConnection(null);
    this._connectTimer.start();
  }
  AttemptConnection(_event: any) {
    this._sLC.send(this._sConnection, 'setUnique', this._unique);
  }
  /** (slave) received the master's number */
  setUnique(unique: number) {
    this._unique = int(unique);
    this._rConnection += this._unique;
    this._sConnection += this._unique;
    this._sLC.send(this._sConnection, 'slaveReceivedUnique');
    this._sLC.addEventListener(StatusEvent.STATUS, this.onStatus);
    this._rLC.close();
    this._rLC.connect(this._rConnection);
    this._rLC.client = this._uniqueClient;
    this._connected = true;
  }
  /** (master) the slave answered */
  slaveReceivedUnique() {
    this._sLC.removeEventListener(StatusEvent.STATUS, this.onConnectionStatus);
    this._sLC.addEventListener(StatusEvent.STATUS, this.onStatus);
    this._connected = true;
    this._sConnection += this._unique;
    this._connectTimer.stop();
    this._connectTimer.removeEventListener('timer', this.AttemptConnection);
    this._rLC.close();
    this._rLC.connect(this._rConnection);
    this._rLC.client = this._uniqueClient;
  }
  send(method: string, ...args: any[]) {
    if (args.length > 0) {
      this._sLC.send(this._sConnection, method, args);
    } else {
      this._sLC.send(this._sConnection, method);
    }
  }
  onConnectionStatus(event: any) {
    if (event.level == 'status') {
      this.slaveReceivedUnique();
    }
  }
  onStatus(_event: any) {}
}
bindMethods(Connection);
