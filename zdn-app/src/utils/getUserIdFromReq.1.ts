

export function getUserIdFromReq(req): string {
  return req?.user?.id || null;
}
