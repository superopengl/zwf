
export function getEmailRecipientName(user) {
  const { givenName, surname } = user;
  const name = `${givenName || ''} ${surname || ''}`.trim();
  return name || 'Client';
}
