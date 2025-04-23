import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { filter, tap } from 'rxjs';


export function useZevent(filterHandler, eventHandler, deps = []) {
  const context = React.useContext(GlobalContext);
  const { zeventBus$ } = context;

  React.useEffect(() => {
    const sub$ = zeventBus$.pipe(
      filter(z => !filterHandler || filterHandler(z)),
    ).subscribe(eventHandler);

    return () => sub$.unsubscribe();
  }, [filterHandler, eventHandler, ...deps]);

  return null;
}
