import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { tap } from 'rxjs';


export function useSubscribeZevent(eventHandler, deps = []) {
  const context = React.useContext(GlobalContext);
  const {zeventBus$} = context;

  React.useEffect(() => {
    const sub$ = zeventBus$.pipe(
      tap(eventHandler)
    ).subscribe();

    return () => sub$.unsubscribe();
  }, [...deps]);

  return null;
}
