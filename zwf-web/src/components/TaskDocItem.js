import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Spin, Space, Badge, Tooltip, Tag } from 'antd';
import { getFileMeta } from 'services/fileService';
import { FileIcon } from './FileIcon';
import { from, Subscription } from 'rxjs';
import { Loading } from './Loading';
import { TimeAgo } from './TimeAgo';
import { getTaskDocDownloadUrl } from 'services/taskDocService';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined } from '@ant-design/icons'
import _ from 'lodash';

const { Link, Text } = Typography;

const getAutoDocTag = (taskDoc, role) => {
  if (role === 'client' || taskDoc.type !== 'auto') {
    return null;
  }

  let label = 'pending';
  let color = '#fadb14';
  let tooltipMessage = 'The file is not generated yet. Fill in fields first.';
  if (taskDoc.fileId) {
    label = <CheckOutlined />;
    color = '#2da44e';
    tooltipMessage = 'The file has been generated.';
  }

  return <Tooltip title={tooltipMessage}>
    <Tag color={color} style={{ borderRadius: 999 }}>{label}</Tag>
  </Tooltip>
}

const getMissingVarWarningMessage = (variables, varBag) => {
  const missingVars = [];
  // debugger;
  for (const varName of variables) {
    const def = varBag[varName];
    if (!def) {
      // Not found in varBag
      missingVars.push(<>Variable '<strong>{varName}</strong>' is not defined in task</>)
    } else if (def.value === undefined || (_.isString(def.value) && def.value === '')) {
      missingVars.push(<>Field '<strong>{def.fieldName}</strong>' has no value</>)
    }
  }

  return missingVars.length ? missingVars : null;
}

export const TaskDocItem = props => {
  const { taskDoc, showIcon, style, showCreatedAt, strong, description, align, iconOverlay, varBag, fields } = props;
  const context = React.useContext(GlobalContext);

  const missingVars = React.useMemo(() => {
    return getMissingVarWarningMessage(taskDoc.variables, varBag)
  }, [taskDoc, varBag]);

  return <Space size="small" align={align} style={{ width: '100%', lineHeight: 1.4, ...style }}>
    {showIcon && <div style={{ position: 'relative' }}>
      <FileIcon name={taskDoc.name} />
      {iconOverlay && <div
        style={{ position: 'absolute', right: -2, top: -2 }}
      >{iconOverlay}</div>}
    </div>}
    <div>
      <Link href={getTaskDocDownloadUrl(taskDoc.id)} target="_blank" strong={strong}>
        {taskDoc.name} {getAutoDocTag(taskDoc, context.role)}
      </Link>
      {showCreatedAt && taskDoc.createdAt && <div><small><TimeAgo value={taskDoc.createdAt} prefix="Created:" direction="horizontal" /></small></div>}
      {missingVars && <div style={{marginTop: 4}}><small>{missingVars.map(x => <div><Text type="danger">{x}</Text></div>)}</small></div>}
    </div>
  </Space>
};

TaskDocItem.propTypes = {
  taskDoc: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  showIcon: PropTypes.bool,
  showCreatedAt: PropTypes.bool,
  strong: PropTypes.bool,
  description: PropTypes.object,
  iconOverlay: PropTypes.object,
  align: PropTypes.oneOf(['start', 'center']),
  varBag: PropTypes.object,
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  strong: false,
  align: 'start',
  varBag: {},
}

