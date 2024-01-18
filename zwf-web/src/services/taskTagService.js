import { httpGet$, httpPost$, httpDelete$ } from './http';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';

const taskTagsSource$  = new BehaviorSubject(null)

export function listTaskTags$() {
  return httpGet$(`/tasktag`).pipe(
    tap(tags => taskTagsSource$.next(tags))
  );
}

export function deleteTaskTag$(id) {
  return httpDelete$(`/tasktag/${id}`);
}

export function saveTaskTag$(tag) {
  const { id, name, colorHex } = tag;
  return httpPost$(`/tasktag`, { id, name, colorHex });
}

export function subscribeTaskTags(func) {
  return taskTagsSource$.pipe(
    switchMap(tags =>  tags ? of(tags) : listTaskTags$()),
  ).subscribe(tags => func(tags));
}