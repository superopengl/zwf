import { notification } from 'antd';

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

