import React from 'react';
import { loadMyUnackZevents$, } from 'services/zeventService';
import { useAuthUser } from 'hooks/useAuthUser';
import { ZeventContext } from 'contexts/ZeventContext';
import { useEstablishZeventStream } from 'hooks/useEstablishZeventStream';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { establishZeventRawStream } from 'services/zeventService';
import { Subject } from 'rxjs';


export const ZeventContainer = (props) => {
  const { children } = props;
  const [user] = useAuthUser();
  const [zevents, setZevents] = React.useState([]);
  const zeventSourceRef = React.useRef(new Subject());

  const handleNewEvent = React.useCallback((z) => {
    switch (z.type) {
      case 'taskEvent':
        zeventSourceRef.current.next(z);
        setZevents(pre => [...pre, z])
        break;
      case 'taskEvent.ack':
        setZevents(pre => pre.filter(x => x.payload.eventId !== z.payload.eventId));
        break;
      case 'support':
        break;
      default:
        break;
    }
  }, [user]);


  React.useEffect(() => {
    debugger;
    const es = establishZeventRawStream();

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      handleNewEvent(event);
    }

    return () => {
      es?.close()
    }
  }, [handleNewEvent, user]);


  /**
   * Initial load
   */

  const getZevent$ = React.useCallback(() => {
    return zeventSourceRef.current;
  }, []);

  const load$ = () => {
    return loadMyUnackZevents$()
      .subscribe({
        next: setZevents
      });
  }

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, []);

  // /**
  //  * Zevent source
  //  */
  // const filterZevent = React.useCallback(() => true, []);

  // const handleZevent = React.useCallback(z => {
  //   const { type } = z;
  //   switch (type) {
  //     case 'taskEvent':
  //       setZevents(pre => [...pre, z])
  //       break;
  //     case 'taskEvent.ack':
  //       // setZevents(pre => pre.filter(z => z.payload.eventId !== payload.eventId));
  //       break;
  //     case 'support':
  //       break;
  //     default:
  //       break;
  //   }
  // }, []);


  const ackEvent = (z) => {
    // const { payload: { taskId, type } } = z;
    // navigate(`/task/${taskId}`, { state: { type } });
    // ackTaskEventType$(taskId, type).subscribe({
    //   // next: () => setOpen(false),
    //   error: () => { /** Swallow error */ },
    // });
  }

  return <ZeventContext.Provider value={{
    zevents,
    getZevent$,
    ackEvent,
  }}>
    {children}
  </ZeventContext.Provider>
};


ZeventContainer.propTypes = {
};

ZeventContainer.defaultProps = {
};