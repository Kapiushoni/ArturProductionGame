// @ts-nocheck
import { LocalConnection, StatusEvent, Timer, bindMethods, int } from '@/flash/as3';

export class Connection {
  _rLC = new LocalConnection();
  _sLC = new LocalConnection();
  declare _rConnection: any;
  declare _sConnection: any;
  declare _connected: any;
  declare _connectTimer: any;
  declare _unique: any;
  declare _uniqueClient: any;
  declare _master: any;
  constructor(rConnection, sConnection, uniqueClient, master) {
         
         this._rConnection = rConnection;
         this._sConnection = sConnection;
         this._uniqueClient = uniqueClient;
         this._master = master;
         if(this._master)
         {
            this._unique = Math.floor(Math.random() * 10000);
            this._rConnection += this._unique;
            this.initConnection();
            this._rLC.connect(this._rConnection);
            this._rLC.client = this;
         }
         else
         {
            this._rLC.connect(this._rConnection);
            this._rLC.client = this;
         }
      }
  initConnection() {
         this._connectTimer = new Timer(2000);
         this._connectTimer.addEventListener("timer",this.AttemptConnection);
         this._sLC.addEventListener(StatusEvent.STATUS,this.onConnectionStatus);
         this.AttemptConnection(null);
         this._connectTimer.start();
      }
  AttemptConnection(event) {
         this._sLC.send(this._sConnection,"setUnique",this._unique);
      }
  setUnique(unique) { unique = int(unique);
         this._unique = unique;
         this._rConnection += this._unique;
         this._sConnection += this._unique;
         this._sLC.send(this._sConnection,"slaveReceivedUnique");
         this._sLC.addEventListener(StatusEvent.STATUS,this.onStatus);
         this._rLC.close();
         this._rLC.connect(this._rConnection);
         this._rLC.client = this._uniqueClient;
         this._connected = true;
      }
  slaveReceivedUnique() {
         this._sLC.removeEventListener(StatusEvent.STATUS,this.onConnectionStatus);
         this._sLC.addEventListener(StatusEvent.STATUS,this.onStatus);
         this._connected = true;
         this._sConnection += this._unique;
         this._connectTimer.stop();
         this._connectTimer.removeEventListener("timer",this.AttemptConnection);
         this._rLC.close();
         this._rLC.connect(this._rConnection);
         this._rLC.client = this._uniqueClient;
      }
  send(text, ... rest) {
         if(rest.length > 0)
         {
            this._sLC.send(this._sConnection,text,rest);
         }
         else
         {
            this._sLC.send(this._sConnection,text);
         }
      }
  onConnectionStatus(event) {
         switch(event.level)
         {
            case "status":
               this.slaveReceivedUnique();
               break;
            case "error":
         }
      }
  onStatus(event) {
         switch(event.level)
         {
            case "status":
            case "error":
         }
      }
}
Connection.prototype._rConnection = null;
Connection.prototype._sConnection = null;
Connection.prototype._connected = false;
Connection.prototype._connectTimer = null;
Connection.prototype._unique = null;
Connection.prototype._uniqueClient = null;
Connection.prototype._master = false;
bindMethods(Connection);
