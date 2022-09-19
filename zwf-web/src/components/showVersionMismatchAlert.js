import { BehaviorSubject } from 'rxjs';

export const versionMismatchSubject$ = new BehaviorSubject();

export const showVersionMismatchAlert = (webappVersion, backendVersion) => {
  if (webappVersion === backendVersion) {
    return;
  }

  versionMismatchSubject$.next(backendVersion);
}