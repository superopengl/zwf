import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Spin, Space } from 'antd';
import { getFileMeta } from 'services/fileService';
import { FileIcon } from './FileIcon';
import { from, Subscription } from 'rxjs';
import { Loading } from './Loading';
import { TimeAgo } from './TimeAgo';
import { getTaskDocDownloadUrl } from 'services/taskDocService';

const { Link } = Typography;

export const TaskDocItem = React.memo(props => {
  const { taskDoc, showIcon, style, showCreatedAt, strong, description, align } = props;

  return <Space size="small" align={align} style={{ width: '100%', lineHeight:1.4,  ...style }}>
    {showIcon && <FileIcon name={taskDoc.name} />}
    <div>
      <Link href={getTaskDocDownloadUrl(taskDoc.id)} target="_blank" strong={strong}>
        {taskDoc.name}
      </Link>
      {showCreatedAt && taskDoc.createdAt && <div><small><TimeAgo value={taskDoc.createdAt} prefix="Created:" direction="horizontal" /></small></div>}
      {description && <div><small>{description}</small></div>}
    </div>
  </Space>
});

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
  align: PropTypes.oneOf(['start', 'center'])
};

TaskDocItem.defaultProps = {
  showIcon: true,
  showCreatedAt: false,
  strong: false,
  align: 'start'
}

