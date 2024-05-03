import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { Space, Typography } from 'antd';
import { CheckCircleFilled, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Icon, { CheckCircleOutlined } from '@ant-design/icons';
import { BsFillPenFill } from 'react-icons/bs';
import { FileIcon } from './FileIcon';
import { getTaskDocDownloadUrl } from "services/taskService";

const {Link} = Typography

const StyledFileIcon = styled.div`
  position: relative;
  display: inline-block;

  .overlay {
    position: absolute;
    // background-color: white;
    bottom: 0;
    right: 0;
    opacity: 0.5;
  }
`;

export const TaskFileName = props => {
  const { taskFile } = props;
  const { name, docTemplateId, fileId, signedAt, requiresSign } = taskFile

  let iconType = 'default';
  if (signedAt) {
    iconType = 'signed'
  } else if (requiresSign) {
    iconType = 'await-sign';
  }

  return <Link href={getTaskDocDownloadUrl(fileId)} target="_blank">
    <Space>
      <FileIcon name={name} type={iconType} />
      {name}
    </Space>
  </Link>
}

TaskFileName.propTypes = {
  taskFile: PropTypes.shape({
    fileId: PropTypes.string,
    docTemplateId: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
};

TaskFileName.defaultProps = {

};
