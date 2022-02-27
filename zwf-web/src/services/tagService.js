import { httpGet$, httpPost$, httpDelete$ } from './http';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';

const taskTagsSource$ = new BehaviorSubject(null)
let listLoading = false;

export function listTags$() {
  if (!listLoading) {
    listLoading = true;
    return httpGet$(`/tag`).pipe(
      tap(() => {
        listLoading = false;
      }),
      tap(tags => taskTagsSource$.next(tags))
    );
  } else {
    return taskTagsSource$;
  }
}

export function deleteTag$(id) {
  return httpDelete$(`/tag/${id}`);
}

export function saveTag$(tag) {
  const { id, name, colorHex } = tag;
  return httpPost$(`/tag`, { id, name, colorHex });
}

export function subscribeTags(func) {
  return taskTagsSource$.pipe(
    switchMap(tags => tags ? of(tags) : listTags$()),
  ).subscribe(tags => func(tags));
}
