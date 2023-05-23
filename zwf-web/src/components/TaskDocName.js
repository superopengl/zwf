import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Space, Typography, Tag } from 'antd';
import { FileIcon } from './FileIcon';
import { useDemplatePreviewModal } from './useDemplatePreviewModal';
import { openTaskDoc$ } from 'services/fileService';
import { Loading } from './Loading';
import { TaskContext } from 'contexts/TaskContext';
import { Alert } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import { finalize } from 'rxjs';

const { Link, Text } = Typography

export const TaskDocName = props => {
  const { taskDoc, showOverlay, allowDownload, onClick, strong } = props;

  const { id, name, fileId, demplateId, signedAt, signRequestedAt } = taskDoc
  const [loading, setLoading] = React.useState(false);
  const [openPreview, previewContextHolder] = useDemplatePreviewModal();

  const hasFile = !!fileId;

  const iconType = React.useMemo(() => {
    if (showOverlay) {
      if (signedAt) {
        return 'signed'
      } else if (signRequestedAt) {
        return 'await-sign';
      } else if (!hasFile) {
        return 'pending';
      } else {
        return 'default'
      }
    }
  }, [showOverlay, signedAt, signRequestedAt, hasFile]);

  const handleOpenTaskDoc = (e) => {
    onClick?.();
    if (!allowDownload) {
      return;
    }
    e.stopPropagation();
    if (loading) {
      return;
    }
    setLoading(true)
    openTaskDoc$(id).pipe(
      finalize(() => setLoading(false)),
    ).subscribe(result => {
      if (!result.fileUrl && demplateId) {
        openPreview(demplateId, name);
      }
    });
  }

  return <>
    <Link onClick={handleOpenTaskDoc} strong={strong}>
      <Space>
        <FileIcon name={name} type={iconType} />
        <Text>{name}</Text>
        <Loading loading={loading} size={14} />
      </Space>
    </Link>
    {previewContextHolder}
  </>
}

TaskDocName.propTypes = {
  taskDoc: PropTypes.shape({
    fileId: PropTypes.string,
    demplateId: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  showOverlay: PropTypes.bool,
  allowDownload: PropTypes.bool,
  strong: PropTypes.bool,
  onClick: PropTypes.func,
};

TaskDocName.defaultProps = {
  showOverlay: true,
  allowDownload: true,
  strong: false,
};
