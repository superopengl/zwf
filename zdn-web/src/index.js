import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import App from './App';
import * as serviceWorker from './serviceWorker';

console.log(process.env);

ReactDOM.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

Notification.requestPermission().then((result) => {
  if (result === 'granted') {
    console.log('Notification and Push are granted');
  }
});

function randomNotification() {
  const notifTitle = 'Ziledin';
  const notifBody = `Welcome to Ziledin`;
  const notifImg = `/images/logo-tile.png`;
  const options = {
    body: notifBody,
    icon: notifImg,
    requireInteraction: true,
  };
  new Notification(notifTitle, options);
}
randomNotification();