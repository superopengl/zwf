import React from 'react';

import { Modal } from 'antd';

import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

export const CreateTaskModal = withRouter(React.memo(props => {
  const { visible, onOk, onCancel, taskTemplateId, userId } = props;
  return <Modal
    visible={visible}
    title={<><TaskIcon /> Create New Task</>}
    icon={<TaskIcon />}
    closable={true}
    maskClosable={false}
    destroyOnClose={true}
    footer={null}
    width={600}
    focusTriggerAfterClose={false}
    onCancel={onCancel}
    onOk={onOk}
    okButtonProps={{
      style: {
        display: 'none'
      }
    }}
  >
    <TaskGenerator
      taskTemplateId={taskTemplateId}
      userId={userId}
      onCancel={onCancel}
      onCreated={(task) => {
        onOk(task);
      }}
    />
  </Modal>
}));

TaskGenerator.propTypes = {
  taskTemplateId: PropTypes.string,
  userId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
};

TaskGenerator.defaultProps = {
  visible: false,
  onCancel: () => { },
  onOk: () => { },
};