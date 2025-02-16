import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeepLinkedTask$ } from 'services/taskService';
import { catchError } from 'rxjs/operators';
import { useAssertRole } from 'hooks/useAssertRole';
import { useRole } from 'hooks/useRole';

const TaskDirectPage = (props) => {
  useAssertRole(['guest', 'client', 'agent', 'admin'],  '/404');
  const params = useParams();
  const { token } = params;

  const role = useRole();
  const navigate = useNavigate();

  const isGuest = role === 'guest';

  React.useEffect(() => {
    if (isGuest) {
      // If not logged in, show login page
      navigate(`/login?r=/task/direct/${token}`)
    } else {
      // If logged in, go to the task page.
      const sub$ = getDeepLinkedTask$(token)
        .pipe(
          catchError(() => navigate('/'))
        )
        .subscribe(task => {
          navigate(`/task/${task.id}`)
        });
      return () => sub$.unsubscribe()
    }
  }, []);

  return null
};

export default TaskDirectPage;
