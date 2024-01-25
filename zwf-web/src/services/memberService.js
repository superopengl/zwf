import { httpGet$ } from './http';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

const memberSource$  = new BehaviorSubject(null);

export function listOrgMembers$() {
  return httpGet$(`/org/member`).pipe(
    tap(members => {
      memberSource$.next(members)
    })
  );
}

export function subscribeMembers(func) {
  return memberSource$.pipe(
    switchMap(members =>  {
      return members ? of(members) : listOrgMembers$()
    }),
  ).subscribe(members => func(members));
}