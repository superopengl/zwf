import React from 'react';
import { withRouter } from 'react-router-dom';
import { getDeepLinkedTask$ } from 'services/taskService';
import { GlobalContext } from 'contexts/GlobalContext';
import { catchError } from 'rxjs/operators';

const TaskDirectPage = (props) => {
  const { token } = props.match.params;

  const context = React.useContext(GlobalContext);

  const isGuest = context.role === 'guest';

  React.useEffect(() => {
    if (isGuest) {
      // If not logged in, show login page
      props.history.push(`/login?r=/task/direct/${token}`)
    } else {
      // If logged in, go to the task page.
      const sub$ = getDeepLinkedTask$(token)
        .pipe(
          catchError(() => props.history.push('/'))
        )
        .subscribe(task => {
          props.history.push(`/task/${task.id}`)
        });
      return () => sub$.unsubscribe()
    }
  }, []);

  return null
};

export default withRouter(TaskDirectPage);
