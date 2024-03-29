import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, Tooltip, Avatar, Button, Row, Col } from 'antd';
import _ from 'lodash';
import Icon, { CloseOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { showSignTaskFileModal } from '../hooks/useSignTaskDocModal';
import { Modal } from 'antd';
import { RiQuillPenFill } from 'react-icons/ri';
import { TaskDocName } from './TaskDocName';
import { useRole } from 'hooks/useRole';

const { Link, Text } = Typography;

const StyledListItem = styled(Row)`
margin-top: 4px;
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
  const { value: taskDoc, showIcon, style, showCreatedAt, strong, onChange, onDelete, disabled } = props;
  const role = useRole();

  const isClient = role === 'client';
  const isOrg = role === 'agent' || role === 'admin';

  const canClientSign = isClient && taskDoc.requiresSign && !taskDoc.signedAt
  const canRequestSign = isOrg && !taskDoc.signedAt;

  const canDelete = isOrg && !taskDoc.signedAt;

  const handleToggleRequireSign = () => {
    taskDoc.requiresSign = !taskDoc.requiresSign;
    onChange(taskDoc);
  }

  const handleSignTaskDoc = () => {
    showSignTaskFileModal(taskDoc, {
      onOk: () => {
        taskDoc.signedAt = new Date();
        onChange(taskDoc);
      },
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: <Space>
        <Avatar icon={<CloseOutlined />} style={{ backgroundColor: '#cf222e' }} />
        Delete file
      </Space>,
      content: <>Delete file <strong>{taskDoc.name}</strong> from this task?</>,
      closable: true,
      maskClosable: true,
      icon: null,
      onOk: () => onDelete(taskDoc),
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
      <TaskDocName taskDoc={taskDoc} />
    </Col>
    {!disabled && <Col style={{ paddingTop: 6 }}>
      <Space size="small">
        {canClientSign && <Tooltip title="Sign this document">
          <Button
            type="primary"
            danger
            icon={<Icon component={RiQuillPenFill} />}
            onClick={handleSignTaskDoc}
          >Sign</Button>
        </Tooltip>}
        {canRequestSign && <Tooltip title={taskDoc.requiresSign ? 'Click to cancel the signature request' : 'Ask client to sign this doc'}>
          <Button shape="circle"
            type={taskDoc.requiresSign ? 'primary' : 'default'}
            icon={<Icon component={RiQuillPenFill} />}
            onClick={handleToggleRequireSign}
          />
        </Tooltip>}
        {isOrg && <Tooltip title="Delete file">
          <Button key="delete" icon={<MinusCircleOutlined />} type="text" onClick={handleDelete} disabled={!canDelete} />
        </Tooltip>}
      </Space>
    </Col>}
  </StyledListItem>
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
  disabled: PropTypes.bool,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  onChange: () => { },
  onDelete: () => { },
  disabled: false,
}

