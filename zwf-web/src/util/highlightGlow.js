import { timer } from 'rxjs';

export function highlightGlow(ref, className = 'hightlighten-glowing') {
  const target = ref.current;
  target.classList.remove(className);
  timer(0).subscribe(() => target.classList.add(className));
}
