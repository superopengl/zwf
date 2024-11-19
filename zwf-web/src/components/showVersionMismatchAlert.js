import { BehaviorSubject } from 'rxjs';

export const versionMismatchSubject$ = new BehaviorSubject();

export const showVersionMismatchAlert = (webappVersion, backendVersion) => {
  versionMismatchSubject$.next(backendVersion);
}