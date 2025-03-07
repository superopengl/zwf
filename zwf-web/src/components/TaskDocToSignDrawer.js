import { Drawer, List, Button, Avatar, Row, Typography } from 'antd';
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

const { Paragraph } = Typography;


export const TaskDocToSignDrawer = React.memo((props) => {
  const { docs, visible } = props;
  const [open, setOpen] = React.useState(false);
  const [docsToSign, setDocsToSign] = React.useState([]);

  React.useEffect(() => {
    const targetDocs = docs.filter(d => d.signRequestedAt);
    setDocsToSign(targetDocs);
    setOpen(targetDocs.length > 0);
  }, [docs]);

  return <Drawer
    open={open}
    onClose={() => setOpen(false)}
    title={<><Avatar src={<Icon component={FaSignature} />} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} /> {docsToSign.length} document{docsToSign.length === 1 ? '' : 's'} waiting for you signature</>}
    extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setOpen(false)} />}
    destroyOnClose={true}
    closable={false}
    autoFocus
    maskClosable
    placement='top'
    // bodyStyle={{ padding: 0 }}
    footer={<Row justify="end">
      <Button type="primary">E-sign All Documents</Button>
    </Row>}
  >
    {/* <Paragraph>
      You have 2 documents are waiting for signature
    </Paragraph> */}
    <List
      dataSource={docsToSign}
      renderItem={item => <List.Item
        actions={[
          <Button icon={<Icon component={FaSignature} />} type="primary">Sign</Button>
        ]}
      >
        <TaskDocName taskDoc={item} showOverlay={false} />
      </List.Item>}
    />
  </Drawer>
});

TaskDocToSignDrawer.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

TaskDocToSignDrawer.defaultProps = {
  open: false,
  onClose: () => { },
};

