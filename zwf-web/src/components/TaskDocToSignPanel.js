import { Col, List, Button, Avatar, Row, Typography, Checkbox, Tooltip, Table } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskComment$ } from 'services/taskService';
import { TaskCommentPanel } from './TaskCommentPanel';
import { CloseOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import { UserNameCard } from './UserNameCard';
import { TaskLogPanel } from './TaskLogPanel';
import { delay, of } from 'rxjs';
import { DebugJsonPanel } from './DebugJsonPanel';
import { TaskDocName } from './TaskDocName';
import { FaSignature } from 'react-icons/fa';
import Icon from '@ant-design/icons';
import { useSignTaskDocModal } from '../hooks/useSignTaskDocModal';
import { ProCard } from '@ant-design/pro-components';
import styled from 'styled-components';

const { Paragraph, Link } = Typography;

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

export const TaskDocToSignPanel = React.memo((props) => {
  const { docs, onChange } = props;
  const [open, setOpen] = React.useState(false);
  const [docsToSign, setDocsToSign] = React.useState([]);
  const [agreed, setAgreed] = React.useState(false);
  const [openSignModal, signModalContextHolder] = useSignTaskDocModal();
  const [loading, setLoading] = React.useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  React.useEffect(() => {
    const targetDocs = docs.filter(d => d.signRequestedAt);
    setDocsToSign(targetDocs);
    setOpen(targetDocs.length > 0);
  }, [docs]);

  const handleSignTaskDoc = (taskDoc) => {
    openSignModal({
      taskDoc,
      onOk: () => {
        taskDoc.signedAt = new Date();
        onChange(taskDoc);
      },
    })
  }

  const columns = [
    {
      title: '',
      render: (_, doc) => <TaskDocName taskDoc={doc} showOverlay={false} allowDownload={false} onClick={() => handleSignTaskDoc(doc)}/>
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return <Container>
    <ProCard
      title={<>{docsToSign.length} Document{docsToSign.length === 1 ? '' : 's'} Waiting for Your Signature</>}
      type="inner"
      bodyStyle={{ padding: 16 }}
    >
      {/* <Paragraph>
      You have 2 documents are waiting for signature
    </Paragraph> */}
      <Table
        size="small"
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ]
        }}
        loading={loading}
        pagination={false}
        bordered={false}
        rowKey="id"
        showHeader={false}
        columns={columns}
        dataSource={docsToSign}
        locale={{ emptyText: 'Upload or add doc templates' }}
      />

      <Row align="middle" justify="space-between" style={{ marginTop: 20 }}>
        <Col>
          <Checkbox style={{marginLeft: 8}} checked={agreed} onClick={e => setAgreed(e.target.checked)}>I have read and agree on the <Link underline target="_blank" href="/terms_and_conditions">terms and conditions</Link></Checkbox>
        </Col>
        <Col>
          <Tooltip title={agreed ? null : 'Please tick the checkbox to indicate your agreement to the terms and conditions before signing'} >
            <Button type="primary" icon={<Icon component={FaSignature} />} disabled={!agreed || !selectedRowKeys.length}>Sign {selectedRowKeys.length} selected document{selectedRowKeys.length ===1 ? '': 's'}</Button>
          </Tooltip>
        </Col>
      </Row>
      {signModalContextHolder}

    </ProCard>
  </Container>
});

TaskDocToSignPanel.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  open: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
};

TaskDocToSignPanel.defaultProps = {
  open: false,
  onChange: () => { },
};

