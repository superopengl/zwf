import React from 'react';
import { filter } from 'rxjs';
import { establishZeventStream } from 'services/zeventService';
import { useAuthUser } from './useAuthUser';
import { finalize, Subject } from 'rxjs';
import { GlobalContext } from 'contexts/GlobalContext';

export function useEstablishZeventStream() {
  const { zeventBus$ } = React.useContext(GlobalContext);

  React.useEffect(() => {
    const es = establishZeventStream();

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      zeventBus$.next(event);
    }

    return () => {
      es?.close()
    }
  }, []);
}

