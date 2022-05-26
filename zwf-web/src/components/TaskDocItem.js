import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, List, Tooltip, Tag, Avatar, Button, Checkbox, Row, Col } from 'antd';
import { FileIcon } from './FileIcon';
import { TimeAgo } from './TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons'
import _ from 'lodash';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { BsPatchCheck } from 'react-icons/bs';
import { showSignTaskFileModal } from './showSignTaskFileModal';
import { FaFileSignature } from 'react-icons/fa';
import { getTaskDocDownloadUrl } from "services/taskService";
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { finalize } from 'rxjs/operators';
import DropdownMenu from './DropdownMenu';
import { MdBrightnessAuto } from 'react-icons/md';
import { Modal } from 'antd';
import { FaSignature } from 'react-icons/fa';
import { TaskFileName } from './TaskFileName';

const { Link, Text } = Typography;

const StyledListItem = styled(Row)`
// margin-top: 4px;
padding: 4px 0;

&.error-doc {
  background-color: #cf222e11;
}

&.not-generated {
  background-color: #ffc53d22;
}

.ant-list-item-action {
  margin-left: 46px;
}

.ant-list-item-action-split {
  display: none;
}
`;

export const TaskDocItem = React.memo(props => {
  const { value: taskFile, showIcon, style, showCreatedAt, strong, onChange, onDelete, varBag } = props;
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  const isClient = role === 'client';
  const isOrg = role === 'agent' || role === 'admin';

  const canClientSign = isClient && taskFile.requiresSign && !taskFile.signedAt
  const canRequestSign = isOrg && !taskFile.signedAt;

  const canDelete = isOrg && !taskFile.signedAt;

  const handleToggleRequireSign = () => {
    taskFile.requiresSign = !taskFile.requiresSign;
    onChange(taskFile);
  }

  const handleSignTaskDoc = () => {
    showSignTaskFileModal(taskFile, {
      onOk: () => {
        taskFile.signedAt = new Date();
        onChange(taskFile);
      },
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: <Space>
        <Avatar icon={<DeleteOutlined />} style={{ backgroundColor: '#cf222e' }} />
        Delete file
      </Space>,
      content: <>Delete file <strong>{taskFile.name}</strong> from this task?</>,
      closable: true,
      maskClosable: true,
      icon: null,
      onOk: () => onDelete(taskFile),
      okText: 'Delete it',
      okButtonProps: {
        type: 'primary',
        ghost: true,
        danger: true,
      },
      cancelButtonProps: {
        type: 'text'
      },
      autoFocusButton: 'cancel',
      focusTriggerAfterClose: true,
    });
  }
 
  return <StyledListItem
    onClick={e => e.stopPropagation()}
  // className={missingVars.length > 0 ? 'error-doc' : !taskFile.fileId ? 'not-generated' : null}
  >
    <Col flex={1}>
      <TaskFileName taskFile={taskFile} />
    </Col>
    <Col style={{ paddingTop: 6 }}>
      {canClientSign && <Tooltip title="Sign this document">
        <Button
          type="primary"
          danger
          icon={<Icon component={FaSignature} />}
          onClick={handleSignTaskDoc}
        >Sign</Button>
      </Tooltip>}
      {canRequestSign && <Tooltip title={taskFile.requiresSign ? 'Click to cancel the signature request' : 'Ask client to sign this doc'}>
        <Button shape="circle"
          type={taskFile.requiresSign ? 'primary' : 'default'}
          icon={<Icon component={FaSignature} />}
          onClick={handleToggleRequireSign}
        />
      </Tooltip>}
      {isOrg && <Tooltip title="Delete file">
        <Button key="delete" danger icon={<DeleteOutlined />} type="link" onClick={handleDelete} disabled={!canDelete} />
      </Tooltip>}
    </Col>
  </StyledListItem>

  // return <StyledListItem onClick={e => e.stopPropagation()}
  //   className={missingVars.length > 0 ? 'error-doc' : !taskFile.fileId ? 'not-generated' : null}
  //   actions={isClient ? null : [
  //     // <Button key="auto" icon={<Icon component={BsPatchCheck } />} type="link">Generate</Button>,
  //     taskFile.signedAt ? null : <Checkbox key="require-sign" checked={taskFile.requiresSign} onClick={e => handleToggleRequireSign(taskFile, e.target.checked)}><Link>Require sign</Link></Checkbox>,
  //     <Button key="delete" danger icon={<DeleteOutlined />} type="link" onClick={() => handleDelete(taskFile)}></Button>,
  //   ].filter(x => x)}
  //   extra={<>
  //     {canClientSign(taskFile) && <Button type="link" icon={<Icon component={FaFileSignature} />} onClick={(e) => handleSignTaskDoc(taskFile, e)}>Sign</Button>}
  //     {!isClient && menuConfig.length > 0 && <DropdownMenu config={menuConfig} />}
  //     {taskFile.signedAt && <Tooltip title={<TimeAgo value={taskFile.signedAt} />}><Tag>Signed</Tag></Tooltip>}
  //   </>}
  // >
  //   <List.Item.Meta
  //     avatar={<div style={{ position: 'relative' }}>
  //       <FileIcon name={taskFile.name} />
  //       {iconOverlay && <div
  //         style={{ position: 'absolute', right: -6, top: -6 }}
  //       >{iconOverlay}</div>}
  //     </div>}
  //     title={<Link href={getTaskDocDownloadUrl(taskFile.fileId)} target="_blank">{taskFile.name}</Link>}
  //     description={<>
  //       {showCreatedAt && taskFile.createdAt && <div><TimeAgo value={taskFile.createdAt} prefix="Created:" direction="horizontal" accurate={false} showTime={false} /></div>}
  //       {missingVars.length > 0 && <div style={{ marginTop: 4 }}>{missingVars.map(x => <div><Text type="danger">{x}</Text></div>)}</div>}
  //     </>}
  //   />
  // </StyledListItem>
});

TaskDocItem.propTypes = {
  value: PropTypes.shape({
    fileId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  showIcon: PropTypes.bool,
  showCreatedAt: PropTypes.bool,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  onChange: () => { },
  onDelete: () => { },
}

