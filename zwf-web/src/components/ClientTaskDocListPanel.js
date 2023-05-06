import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Space, Button, Tooltip, Table } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { TimeAgo } from './TimeAgo';
import { TaskDocName } from './TaskDocName';
import { FaSignature } from 'react-icons/fa';
import Icon, { CheckCircleOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { TaskFileUpload } from './TaskFileUpload';
import { finalize } from 'rxjs';

const {Text} = Typography;

const Container = styled.div`

.ant-table-cell {
  border-bottom: none !important;
  // padding: 8px 2px !important;
}
.ant-table-content {
  // margin-left: -8px;
  // margin-right: -8px;
}

`;



export const ClientTaskDocListPanel = React.memo((props) => {
  const { task, onChange, disabled } = props;

  const [loading, setLoading] = React.useState(true);
  const [docs, setDocs] = React.useState(task?.docs ?? []);

  const taskId = task.id;
  // const isPreviewMode = !taskId;

  React.useEffect(() => {
    setDocs(task?.docs ?? []);
    setLoading(false);
  }, [task]);

  const columns = [
    {
      title: '',
      render: (_, doc) => <Tooltip
        color="white"
        placement='leftTop'
        overlayInnerStyle={{ color: '#4B5B76', padding: 20 }}
        title={<Space direction='vertical'>
          <TaskDocName taskDoc={doc} showOverlay={false}/>
            <TimeAgo prefix="Created" direction="horizontal" value={doc.createdAt} />
            {doc.signRequestedAt && <TimeAgo prefix="Sign requested" direction="horizontal" value={doc.signRequestedAt} />}
            {doc.signedAt && <TimeAgo prefix="Signed" direction="horizontal" value={doc.signedAt} />}
        </Space>
        }>
        <div>
          <TaskDocName taskDoc={doc} showOverlay={false}/>
        </div>
      </Tooltip>
    },
    {
      title: 'Created',
      render: (_, doc) => <TimeAgo direction="horizontal" value={doc.createdAt} />
    },
    {
      align: 'right',
      render: (_, doc) => !doc.signRequestedAt ? null :
        doc.signedAt ? <Text type="success"><CheckCircleOutlined/> signed</Text> : 
        null
    },
  ];


  const handleUploadDone = () => {
    setLoading(false);
    onChange();
  }

  return <Container>
    <ProCard
      title={<>{docs.length ?? 0} Attachment{docs.length === 1 ? '' : 's'}</>}
      type="inner"
      extra={disabled ? null : <TaskFileUpload taskId={taskId} onLoading={setLoading} onDone={handleUploadDone} disabled={disabled}/>}
      bodyStyle={{padding: 16}}
      headStyle={{paddingRight: 8}}
    >
      <Table
        size="small"
        loading={loading}
        pagination={false}
        bordered={false}
        rowKey="id"
        showHeader={false}
        columns={columns}
        dataSource={docs}
        locale={{ emptyText: <Text type="secondary">Upload or add doc templates</Text> }}
      />
    </ProCard>
  </Container>
})

ClientTaskDocListPanel.propTypes = {
  task: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
};

ClientTaskDocListPanel.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
  showsLastReadAt: false,
  showsSignedAt: false,
};
