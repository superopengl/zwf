import * as WebSocket from 'ws';

export function createWebsocketServer(wss) {
  wss.chatMap = new Map();

  function ensureActiveParticipants(chatId) {
    const participants = (wss.chatMap.get(chatId) || []).filter(p => p.readyState === WebSocket.OPEN);
    wss.chatMap.set(chatId, participants);
    return participants;
  }

  wss.on('connection', person => {
    person.on('message', message => {
      const { type, chatId, data } = JSON.parse(message);
      switch (type) {
        case 'join': {
          const participants = ensureActiveParticipants(chatId);
          if (participants.every(p => p !== person)) {
            participants.push(person);
          }
          wss.chatMap.set(chatId, participants);
          break;
        }
        case 'chat': {
          const outMessage = JSON.stringify(data);
          const participants = ensureActiveParticipants(chatId);
          participants.forEach(p => {
            // broadcast to all parties in this conversation, excluding itself.
            if (p !== person) {
              p.send(outMessage);
            }
          });
          break;
        }
        case 'leave': {
          const participants = ensureActiveParticipants(chatId).filter(p => p !== person);
          if (participants.length) {
            wss.chatMap.set(chatId, participants);
          } else {
            wss.chatMap.delete(chatId);
          }
          break;
        }
        default:
          throw new Error(`Unsupported message type '${type}'`);
          break;
      }
    });
  });

  return wss;
}