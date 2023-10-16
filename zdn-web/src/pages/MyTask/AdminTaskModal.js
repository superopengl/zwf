import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Modal, Space, Button, Skeleton, Typography } from 'antd';
import PropTypes from 'prop-types';

import { getTask, getTask$ } from 'services/taskService';
import MyTaskSign from './MyTaskSign';
import TaskFormWizard from './TaskFormWizard';
import MyTaskReadView from './MyTaskReadView';
import * as queryString from 'query-string';
import { MessageFilled } from '@ant-design/icons';
import { TaskStatus } from 'components/TaskStatus';
import { Loading } from 'components/Loading';
import { TaskIcon } from 'components/entityIcon';
import { catchError } from 'rxjs/operators';
import { TaskFormPanel } from './TaskFormPanel';
import TaskChatPanel from 'components/TaskChatPanel';
import TaskDetailModal from './TaskPanel';

const { Text } = Typography;


const ContainerStyled = styled(Layout.Content)`
margin: 4rem auto 0 auto;
padding: 2rem 1rem;
// text-align: center;
max-width: 1000px;
width: 100%;
height: 100%;

.ant-layout-sider-zero-width-trigger {
  top: 0;
  left: -60px;
  width: 40px;
  border: 1px solid rgb(217,217,217);
  border-radius:4px;
}
`;


const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const AdminTaskModal = (props) => {
  const id = props.match.params.id;
  const isNew = !id || id === 'new';

  const { chat, portfolioId } = queryString.parse(props.location.search);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();

  // const loadEntity = async () => {
  //   setLoading(true);
  //   if (id && !isNew) {
  //     const task = await getTask(id);
  //     setTask(task);
  //   }
  //   setLoading(false);
  // }

  // React.useEffect(() => {
  //   loadEntity();
  // }, [])

  const onOk = () => {
    props.history.push('/tasks');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  const toggleChatPanel = () => {
    setChatVisible(!chatVisible);
  }

  const showsEditableForm = isNew || task?.status === 'todo';
  const showsSign = task?.status === 'to_sign';
  const showsChat = !isNew;

  return (<Modal
    title={loading ? '' : task.name}
    closable
    maskClosable
    destroyOnClose
  >
    <Loading loading={loading}>

    </Loading>
  </Modal>
  );
};

AdminTaskModal.propTypes = {
  id: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

AdminTaskModal.defaultProps = {
  // taskId: 'new'
};

// export default withRouter(AdminTaskModal);

export function show(taskId, title) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> {title}</>,
    content: <Skeleton active />,
    icon: null,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
  });

  const subscription$ = getTask$(taskId)
    .pipe(
      catchError(e => {
        modalRef.update({
          content: <Text type="danger">Error: {e.message}</Text>
        })
      })
    )
    .subscribe(task => {
      modalRef.update({
        content: <TaskDetailModal task={task} type='client'/>,
        afterClose: () => {
          subscription$.unsubscribe();
        }
      })
    });
}

const TaskModel = {
  show: show
}

export default TaskModel;