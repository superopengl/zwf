import { timer } from 'rxjs';

export function highlightGlow(ref, className = 'hightlighten-glowing') {
  ref.current?.classList.remove(className);
  timer(0).subscribe(() => ref.current?.classList.add(className));
}
