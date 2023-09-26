import React from 'react';
import { establishZeventRawStream } from 'services/zeventService';
import { GlobalContext } from 'contexts/GlobalContext';

export function useEstablishZeventStream(handler) {
  const zeventHanlder = React.useCallback((event) => {
    handler?.(event)
  }, [handler]);

  React.useEffect(() => {
    const es = establishZeventRawStream(zeventHanlder);

    return () => {
      es?.close()
    }
  }, [zeventHanlder]);
}

