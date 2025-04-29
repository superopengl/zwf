import React from 'react';
import { establishZeventRawStream } from 'services/zeventService';
import { GlobalContext } from 'contexts/GlobalContext';

export function useEstablishZeventStream(handler) {
  const zeventHanlder = React.useCallback((event) => {
    handler?.(event)
  }, [handler]);

  React.useEffect(() => {
    const es = establishZeventRawStream();

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      zeventHanlder(event);
    }

    return () => {
      es?.close()
    }
  }, [zeventHanlder]);
}

