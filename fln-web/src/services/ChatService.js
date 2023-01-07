import { WEBSOCKET_URL } from "./http";

export class ChatService {
  onReceiveMessage;
  hasClosed = false;

  constructor(chatId) {
    if (!chatId) throw new Error(`chatId is not specified`);
    this.chatId = chatId;
  }

  open = () => {
    this.ws = new WebSocket(WEBSOCKET_URL);
    this.ws.onopen = () => {
      // console.log('ws connected');
      this._sendMessage({
        type: 'join',
        chatId: this.chatId
      });
    }

    this.ws.onmessage = evt => {
      // console.log('ws message', evt);
      const obj = JSON.parse(evt.data);
      if (this.onReceiveMessage) {
        this.onReceiveMessage(obj);
      }
    };

    this.ws.onclose = () => {
      // console.log('ws disconnected');
    }

    this.ws.onerror = (err) => {
      // console.log('ws error. Reconnecting', err);
      // this.start();
    }
  }

  _sendMessage = (obj) => {
    if (!this.ws) return;
    const message = JSON.stringify(obj);
    this.ws.send(message);
  }

  send = (data) => {
    this._sendMessage({
      type: 'chat',
      chatId: this.chatId,
      data,
    });
  }

  close = () => {
    if (!this.ws) return;
    if (!this.hasClosed) {
      this._sendMessage({
        type: 'leave',
        chatId: this.chatId,
      });
      this.ws.close();
      this.hasClosed = true;
    }
  }
}