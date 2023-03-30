import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { filter, tap } from 'rxjs';


export function useSubscribeZevent(type, eventHandler, deps = []) {
  const context = React.useContext(GlobalContext);
  const { zeventBus$ } = context;

  React.useEffect(() => {
    const sub$ = zeventBus$.pipe(
      filter(zevent => zevent.type === type),
      tap(eventHandler)
    ).subscribe();

    return () => sub$.unsubscribe();
  }, [...deps]);

  return null;
}
