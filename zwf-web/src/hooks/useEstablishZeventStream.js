import React from 'react';
import { establishZeventStream } from 'services/zeventService';
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

