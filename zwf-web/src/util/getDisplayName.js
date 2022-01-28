
export function getUserDisplayName(email, givenName, surname) {
  const displayName = `${givenName ?? ''} ${surname ?? ''}`.trim();
  return displayName || email;
}
