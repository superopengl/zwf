const timezoneOffset = new Date().getTimezoneOffset() * 60000;

export const getUtcNow = (): Date => {
  const now = new Date();
  const utc = new Date(now.getTime() + timezoneOffset);
  return utc;
};

