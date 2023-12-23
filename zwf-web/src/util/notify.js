import { notification } from 'antd';
import innerText from 'react-innertext';

// function createBrowserNotification(title, content) {
//   try {
//     const message = content || title;
//     const notifTitle = content ? `[ZeeWorkFlow] ${title}` : `ZeeWorkFlow`;
//     const options = {
//       body: message,
//       icon: `/images/logo-tile.png`,
//       requireInteraction: true,
//     };
//     new Notification(notifTitle, options);
//   } catch {
//     // Swallow error because browser notification may be disabled by user.
//   }
// }

function request(level, title, content, duration) {
  const key = `${title}`;
  notification[level].call(this, {
    message: title,
    description: content,
    key,
    duration: duration || 4,
    placement: 'topLeft',
    style: { width: '85vw', maxWidth: '380px' }
  });

  // createBrowserNotification(innerText(title), content ? innerText(content) : null);

  return {
    close: () => {
      notification.close(key);
    }
  }
}

export const notify = {
  error(title, content = null) {
    return request('error', title, content, 6);
  },
  success(title, content = null, duration = 4) {
    return request('success', title, content, duration);
  },
  info(title, content = null) {
    return request('info', title, content, 5);
  },
  warn(title, content = null) {
    return request('warn', title, content, 5);
  }
}

