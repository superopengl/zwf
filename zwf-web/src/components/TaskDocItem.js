import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import { Typography, Space, List, Tooltip, Tag, Avatar, Button, Checkbox } from 'antd';
import { FileIcon } from './FileIcon';
import { TimeAgo } from './TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons'
import _ from 'lodash';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { BsPatchCheck } from 'react-icons/bs';
import { showSignTaskDocModal } from './showSignTaskDocModal';
import { FaFileSignature } from 'react-icons/fa';
import { genDoc$, getTaskDocDownloadUrl, toggleTaskDocsRequiresSign$ } from "services/taskDocService";
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { finalize } from 'rxjs/operators';
import DropdownMenu from './DropdownMenu';
import { MdBrightnessAuto } from 'react-icons/md';
import { Modal } from 'antd';

const { Link, Text } = Typography;

const StyledListItem = styled(List.Item)`
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

const getAutoDocTag = (taskDoc, role) => {
  if (role === 'client' || taskDoc.type !== 'auto') {
    return null;
  }

  let label = 'pending';
  let color = '#cf222e';
  let tooltipMessage = 'The file is not generated yet. Fill in fields first.';
  if (taskDoc.fileId) {
    label = 'generated';
    color = '#2da44e';
    tooltipMessage = 'The file has been generated.';
  }

  return <Tooltip title={tooltipMessage}>
    <Icon component={() => <MdBrightnessAuto />} style={{ color, fontSize: 20 }} />
  </Tooltip>
}

const getMissingVarWarningMessage = (taskDoc, varBag) => {
  const { variables, fileId } = taskDoc;
  const missingVars = [];
  if (!fileId && variables) {
    for (const varName of variables) {
      const def = varBag[varName];
      if (!def) {
        // Not found in varBag
        missingVars.push(<>Variable '<strong>{varName}</strong>' is not defined in task</>)
      } else if (def.value === undefined || (_.isString(def.value) && def.value === '')) {
        missingVars.push(<>Field '<strong>{def.fieldName}</strong>' has no value</>)
      }
    }
  }

  return missingVars;
}

export const TaskDocItem = React.memo(props => {
  const { taskDoc, showIcon, style, showCreatedAt, strong, onChange, onDelete, varBag, onLoading } = props;
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  const isClient = role === 'client';
  const isAgent = role === 'agent' || role === 'admin';

  const missingVars = React.useMemo(() => getMissingVarWarningMessage(taskDoc, varBag), [taskDoc, varBag]);

  const canDelete = (taskDoc) => {
    switch (taskDoc.type) {
      case 'client':
        return role === 'client' && user.id === taskDoc.createdBy && !taskDoc.signedAt
      case 'auto':
      case 'agent':
        return (role === 'admin' || role === 'agent') && !taskDoc.signedAt;
    }
    return false;
  }

  const canToggleOfficalOnly = (taskDoc) => {
    return isAgent && taskDoc.type !== 'client' && !taskDoc.signedAt
  }

  const canRequestClientSign = (taskDoc) => {
    return isAgent && taskDoc.type !== 'client' && taskDoc.fileId && !taskDoc.signedAt
  }

  const canClientSign = (taskDoc) => {
    return isClient && taskDoc.requiresSign && !taskDoc.signedAt
  }

  const canGenDoc = (taskDoc) => {
    return !isClient && taskDoc.docTemplateId && !taskDoc.fileId && !missingVars.length
  }

  const handleToggleRequireSign = (taskDoc, checked) => {
    onLoading(true)
    toggleTaskDocsRequiresSign$(taskDoc.id, checked).pipe(
      finalize(() => onLoading(false))
    ).subscribe(() => {
      onChange()
    })
  }

  const handleSignTaskDoc = (taskDoc, e) => {
    e.stopPropagation();
    showSignTaskDocModal(taskDoc, {
      onOk: () => {
        onChange();
      },
    })
  }

  const handleDeleteDoc = (item) => {
    Modal.confirm({
      title: <Space>
        <Avatar icon={<DeleteOutlined />} style={{ backgroundColor: '#cf222e' }} />
        Delete file
      </Space>,
      content: <>Delete file <strong>{item.name}</strong> from this task?</>,
      closable: true,
      maskClosable: true,
      icon: null,
      onOk: () => onDelete(),
      okText: 'Delete it',
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      cancelButtonProps: {
        type: 'text'
      },
      autoFocusButton: 'cancel',
      focusTriggerAfterClose: true,
    });
  }

  const handleGenDoc = (item) => {
    const taskDocId = item.id;
    onLoading(true)
    genDoc$(taskDocId).pipe(
      finalize(() => onLoading(false))
    ).subscribe(() => {
      onChange();
    });
  }

  const iconOverlay = getAutoDocTag(taskDoc, context.role);

  const menuConfig = [
    // {
    //   icon: taskDoc.requiresSign ? <CheckSquareOutlined /> : <BorderOutlined />,
    //   menu: 'Require client sign',
    //   onClick: () => handleToggleRequireSign(taskDoc, !taskDoc.requiresSign)
    // },
    taskDoc.type === 'auto' && !taskDoc.fileId ? {
      icon: <Icon component={() => <BsPatchCheck />} />,
      menu: 'Generate doc',
      onClick: () => handleGenDoc(taskDoc),
      disabled: !canGenDoc(taskDoc),
    } : null,
    canDelete(taskDoc) ? {
      icon: <Text type="danger"><DeleteOutlined /></Text>,
      menu: <Text type="danger">Delete</Text>,
      onClick: () => handleDeleteDoc(taskDoc)
    } : null,

  ].filter(x => x);

  return <StyledListItem onClick={e => e.stopPropagation()}
    className={missingVars.length > 0 ? 'error-doc' : !taskDoc.fileId ? 'not-generated' : null}
    actions={isClient ? null : [
      // <Button key="auto" icon={<Icon component={() => <BsPatchCheck />} />} type="link">Generate</Button>,
      taskDoc.signedAt ? null : <Checkbox key="require-sign" checked={taskDoc.requiresSign} onClick={e => handleToggleRequireSign(taskDoc, e.target.checked)}><Link>Require sign</Link></Checkbox>,
      // <Button key="delete" danger icon={<DeleteOutlined/>} type="link" onClick={() => handleDeleteDoc(taskDoc)}>Delete</Button>,
    ].filter(x => x)}
    extra={<>
      {canClientSign(taskDoc) && <Button type="link" icon={<Icon component={() => <FaFileSignature />} />} onClick={(e) => handleSignTaskDoc(taskDoc, e)}>Sign</Button>}
      {!isClient && menuConfig.length > 0 && <DropdownMenu config={menuConfig} />}

      {taskDoc.signedAt && <Tooltip title={<TimeAgo value={taskDoc.signedAt}/>}><Tag>Signed</Tag></Tooltip>}
    </>}
  >
    <List.Item.Meta
      avatar={<div style={{ position: 'relative' }}>
        <FileIcon name={taskDoc.name} />
        {iconOverlay && <div
          style={{ position: 'absolute', right: -6, top: -6 }}
        >{iconOverlay}</div>}
      </div>}
      title={<Link href={getTaskDocDownloadUrl(taskDoc.id)} target="_blank">{taskDoc.name}</Link>}
      description={<>
        {showCreatedAt && taskDoc.createdAt && <div><TimeAgo value={taskDoc.createdAt} prefix="Created:" direction="horizontal" accurate={false} showTime={false} /></div>}
        {missingVars.length > 0 && <div style={{ marginTop: 4 }}>{missingVars.map(x => <div><Text type="danger">{x}</Text></div>)}</div>}
      </>}
    />
  </StyledListItem>
});

TaskDocItem.propTypes = {
  taskDoc: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  showIcon: PropTypes.bool,
  showCreatedAt: PropTypes.bool,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  onLoading: PropTypes.func,
  varBag: PropTypes.object,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  varBag: {},
  onChange: () => { },
  onDelete: () => { },
  onLoading: () => { },
}

