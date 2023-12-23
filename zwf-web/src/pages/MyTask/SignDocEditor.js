import { Button, List, Space, Typography, Form, Checkbox, Modal } from 'antd';
import { FileIcon } from 'components/FileIcon';
import FileLink from 'components/FileLink';
import { TimeAgo } from 'components/TimeAgo';
import PropTypes from 'prop-types';
import React from 'react';
import { openFile, getFileMetaList } from 'services/fileService';
import { getTask, signTaskDoc } from 'services/taskService';
import styled from 'styled-components';
import * as _ from 'lodash';
import { withRouter } from 'react-router-dom';

const { Link: TextLink , Text} = Typography;

const StyledListItem = styled(List.Item)`
  cursor: pointer;
  border: none !important;

  // &:hover {
  //   background-color: rgba(0,0,0,0.1);
  // }

  .ant-list-item-meta-title {
    margin-bottom: 0;
  }

  strong {
    font-weight: 800;
  }

`;

const SignDocEditor = (props) => {
  const { value, onOk } = props;

  const [task, setTask] = React.useState(value);
  const [loading, setLoading] = React.useState(true);
  const [docToSign, setDocToSign] = React.useState();
  const [docs, setDocs] = React.useState([]);


  const initSignDocs = task => {
    const files = task.docs.filter(d => d.requiresSign);
    const sortedFiles = _.sortBy(files, ['fileName']);
    setDocs(sortedFiles);
    return files
  }

  const loadEntity = async () => {
    setLoading(true);
    const updatedTask = await getTask(task.id);
    setTask(updatedTask);
    const docs = initSignDocs(updatedTask);
    const sortedDocs = _.sortBy(docs, ['fileName']);
    setDocs(sortedDocs);
    setLoading(false);
  }

  React.useEffect(() => {
    initSignDocs(value);
  }, []);

  const handleSignAll = async () => {
    const unsignedFileIds = docs.filter(f => !f.signedAt).map(f => f.fileId);
    await signTaskDoc(task.id, unsignedFileIds);
    await loadEntity();
    onOk();
  }

  const handleFileClick = async (doc) => {
    await openFile(task.id, doc.fileId);
    loadEntity();
  }

  const showSignDocModal = async (e, file) => {
    e.stopPropagation();
    setDocToSign(file);
  }

  const handleSignDoc = async (file) => {
    await signTaskDoc(task.id, [file.fileId]);
    setDocToSign(null);
    await loadEntity();
    onOk();
  }

  const { status } = task || {};

  const isSigned = status === 'signed';
  const canSign = status === 'to_sign' && docs.every(f => !!f.lastReadAt) && !isSigned;

  console.log(docs);
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={docs}
        renderItem={item => (<StyledListItem
          onClick={() => handleFileClick(item)}
          key={item.fileId}
          actions={[
            item.signedAt ? null :
            item.lastReadAt ? <Button type="link" style={{ paddingRight: 0 }} onClick={e => showSignDocModal(e, item)}>Sign</Button> :
              <Button type="link" style={{ paddingRight: 0 }}>View</Button>
          ]}
        >
          <List.Item.Meta
            avatar={<FileIcon style={{ position: 'relative', top: 4 }} name={item.fileName} />}
            title={<TextLink strong={!item.lastReadAt}>{item.fileName}</TextLink>}
            description={<TimeAgo 
              direction="horizontal" 
              value={item.signedAt || item.lastReadAt} 
              prefix={item.signedAt ? 'Signed:' : 'Last view:' }
              defaultContent={<Text strong>Unread</Text>} 
              />}
          />
        </StyledListItem>)}
      />
      {!isSigned && <Form onFinish={handleSignAll}>
        <Form.Item name="" valuePropName="checked" rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox>I have read and agree on the <a href="/declaration" target="_blank">declaration</a></Checkbox>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" block disabled={!canSign}>{canSign ? 'e-Sign All Documents' : 'Please view all documents before sign'}</Button>
        </Form.Item>
      </Form>}
      {isSigned && <Button block type="primary" onClick={() => props.history.goBack()}>OK</Button>}
      <Modal
        visible={docToSign}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setDocToSign(null)}
        onCancel={() => setDocToSign(null)}
        footer={null}
        title="Sign document"
      >
        <Form onFinish={() => handleSignDoc(docToSign)}>
          <Form.Item>
            <FileLink id={docToSign?.fileId} />
          </Form.Item>
          <Form.Item name="" valuePropName="checked" rules={[{
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
          }]}>
            <Checkbox>I have read and agree on the <a href="/declaration" target="_blank">declaration</a></Checkbox>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" block>Sign</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

SignDocEditor.propTypes = {
  id: PropTypes.string
};

SignDocEditor.defaultProps = {};

export default withRouter(SignDocEditor);
