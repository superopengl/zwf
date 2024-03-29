import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import './index.less';
import { App } from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

console.log('env', process.env);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// ReactDOM.render(
//   // <React.StrictMode>
//   <App />
//   // </React.StrictMode>
//   ,
//   container
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorkerRegistration.unregister();
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);

// Notification.requestPermission().then((result) => {
//   if (result === 'granted') {
//     console.log('Notification and Push are granted');
//   }
// });

// function randomNotification() {
//   const notifTitle = 'ZeeWorkflow';
//   const notifBody = `Welcome to ZeeWorkflow`;
//   const notifImg = `/images/logo-tile.png`;
//   const options = {
//     body: notifBody,
//     icon: notifImg,
//     requireInteraction: true,
//   };

//   setTimeout(() => {
//     new Notification(notifTitle, options);
//   }, 2000);
// }
// randomNotification();