import React from 'react';
import { filter } from 'rxjs';
import { establishZeventStream } from 'services/zeventService';
import { useAuthUser } from './useAuthUser';
import { finalize, Subject } from 'rxjs';

export function useEstablishZeventStream() {
  const eventBus$ = React.useRef(new Subject()).current;

  React.useEffect(() => {
    const es = establishZeventStream();

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      eventBus$.next(event);
    }

    return () => {
      es?.close()
    }
  }, []);


  return eventBus$;
}

