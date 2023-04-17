export function getOrgIdFromReq(req): string {
  return req?.user?.orgId || null;
}
