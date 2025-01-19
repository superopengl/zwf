import React from 'react';

import { Modal } from 'antd';

import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';

import PropTypes from 'prop-types';

export const CreateTaskModal = React.memo(props => {
  const { visible, onOk, onCancel, taskTemplateId, client } = props;
  return <Modal
    open={visible}
    title={<><TaskIcon /> Create New Task</>}
    icon={<TaskIcon />}
    closable={true}
    maskClosable={false}
    destroyOnClose={true}
    footer={null}
    width={480}
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
      client={client}
      onCancel={onCancel}
      onCreated={(task) => {
        onOk(task);
      }}
    />
  </Modal>
});

TaskGenerator.propTypes = {
  taskTemplateId: PropTypes.string,
  client: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
};

TaskGenerator.defaultProps = {
  visible: false,
  onCancel: () => { },
  onOk: () => { },
};