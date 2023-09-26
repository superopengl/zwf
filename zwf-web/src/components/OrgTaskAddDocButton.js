import React from 'react';
import PropTypes from 'prop-types';
import { Space, Button, Tooltip, Table, Modal, Dropdown, Typography } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { TimeAgo } from './TimeAgo';
import { deleteTaskDoc$, requestSignTaskDoc$, unrequestSignTaskDoc$, addDemplateToTask$, generateDemplateDoc$, } from 'services/taskService';
import { TaskDocName } from './TaskDocName';
import Icon, { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { useAddDemplateToTaskModal } from 'hooks/useAddDemplateToTaskModal';
import { BsFileEarmarkTextFill } from 'react-icons/bs';
import { TaskFileUpload } from './TaskFileUpload';
import DropdownMenu from './DropdownMenu';
import { RiQuillPenLine, RiQuillPenFill } from 'react-icons/ri';
import { TaskDocDescription } from './TaskDocDescription';
import { TaskContext } from 'contexts/TaskContext';

const { Text } = Typography;



export const OrgTaskAddDocButton = React.memo((props) => {
  const { onChange } = props;

  const [loading, setLoading] = React.useState(true);
  const [deleteModal, deleteModalContextHolder] = Modal.useModal();
  const { task } = React.useContext(TaskContext);
  const [docs, setDocs] = React.useState(task?.docs ?? []);
  const [openAddDemplate, demplateContextHolder] = useAddDemplateToTaskModal();

  const taskId = task.id;
  // const isPreviewMode = !taskId;

  React.useEffect(() => {
    setDocs(task?.docs ?? []);
    setLoading(false);
  }, [task]);


  const handleAddDemplates = (demplateIds) => {
    setLoading(true);
    addDemplateToTask$(task.id, demplateIds)
      .pipe(
        finalize(() => setLoading(false)),
      )
      .subscribe({
        next: onChange,
        error: () => { },
      });
  }

  const handleUploadDone = () => {
    setLoading(false);
    onChange();
  }

  const items = [{
    key: 'upload',
    label: <TaskFileUpload taskId={taskId} onLoading={setLoading} onDone={handleUploadDone} />
  }, {
    key: 'demplate',
    label: <Button
      icon={<Icon component={BsFileEarmarkTextFill} />}
      type="text"
      block
      onClick={() => openAddDemplate({ onChange: handleAddDemplates })}
    >Doc Template</Button>
  }]

  return <Dropdown menu={{ items, onClick: ({ domEvent }) => domEvent.stopPropagation() }} overlayClassName="task-add-doc-menu" disabled={loading}>
    <Button icon={<PlusOutlined />}>Add Document</Button>
  </Dropdown>
})

OrgTaskAddDocButton.propTypes = {
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
};

OrgTaskAddDocButton.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
  showsLastReadAt: false,
  showsSignedAt: false,
};
