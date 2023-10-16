import { Typography, Form, Divider, Skeleton, Row, Col, Modal } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import PropTypes from 'prop-types';
import { convertTaskTemplateFieldsToFormFieldsSchema } from '../../util/convertTaskTemplateFieldsToFormFieldsSchema';
import { getTask$ } from 'services/taskService';
import TaskFormPanel from './TaskFormPanel';
import TaskChatPanel from 'components/TaskChatPanel';
import { TaskIcon } from 'components/entityIcon';

const { Title, Paragraph, Text } = Typography;


export const TaskDetailModal = React.memo((props) => {

  const { taskId, name, type, visible: propVisbile, onClose } = props;

  const [task, setTask] = React.useState();
  const [visible, setVisible] = React.useState(propVisbile);

  React.useEffect(() => {
    if(!taskId) {
      return;
    }
    getTask$(taskId).pipe(

    ).subscribe(task => {
      setTask(task);
    });
  }, [taskId]);

  React.useEffect(() => {
    setVisible(propVisbile)
  }, [propVisbile]);

  return (
    <Modal
      visible={visible}
      maskClosable={true}
      closable={true}
      onOk={onClose}
      onCancel={onClose}
      destroyOnClose={true}
      width={800}
      title={<><TaskIcon /> {name}</>}
    >
      {!task ? <Skeleton active /> : <Row gutter={[20,20]}>
        <Col span={12}>
        <TaskFormPanel value={task} type={type} />
        </Col>
        <Col span={12}>
        <TaskChatPanel taskId={task.id} />
        </Col>
      </Row>}
    </Modal>
  );
});

TaskDetailModal.propTypes = {
  taskId: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

TaskDetailModal.defaultProps = {
  type: 'client',
  visible: false,
};

export default TaskDetailModal;
