import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { filter, tap } from 'rxjs';


export function useZevent(filterHandler, eventHandler, deps = []) {
  const context = React.useContext(GlobalContext);
  const { zeventBus$ } = context;

  React.useEffect(() => {
    const sub$ = zeventBus$.pipe(
      filter(zevent => !filterHandler || filterHandler(zevent)),
    ).subscribe(eventHandler);

    return () => sub$.unsubscribe();
  }, [...deps]);

  return null;
}
