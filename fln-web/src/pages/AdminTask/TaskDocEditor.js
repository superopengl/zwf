import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Button, Space, Modal, Tooltip, Tag } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { FileIcon } from '../../components/FileIcon';
import FileLink from '../../components/FileLink';
import {
  QuestionCircleOutlined, DeleteOutlined, FileAddOutlined, UploadOutlined,
  HighlightOutlined, ExclamationCircleOutlined, FlagOutlined
} from '@ant-design/icons';
import { TimeAgo } from '../../components/TimeAgo';
import { Table } from 'antd';
import GenDocStepperModal from './GenDocStepperModal';

const { Text } = Typography;

const Container = styled.div`
& {
  .ant-upload-list-item {
    height: 60px;
  }
  .ant-upload-list-item-card-actions-btn {
    // background-color: yellow !important;
    width: 60px;
    height: 60px;
    position: relative;
    opacity: 0.5;
  }

  .ant-upload-list-item-info > span {
    display: flex;
    align-items: center;
  }

  .ant-upload-text-icon {
    display: inline-block;
  }
  .ant-upload-list-item-name {
    width: auto;
    padding-left: 8px;
  }
}`;


const PendingDoc = styled.div`
  &:hover {
    cursor: pointer;
  }
`;

export const TaskDocEditor = (props) => {
  const { value, fields, onChange } = props;

  const [docList, setDocList] = React.useState(value);
  const [loading, setLoading] = React.useState(false);
  const [genDocModalVisible, setGenDocModalVisible] = React.useState(false);
  const [docTemplateId, setDocTemplateId] = React.useState();

  React.useEffect(() => {
    setDocList(value);
  }, [value]);

  const handleChange = (info) => {
    const { file } = info;
    switch (file.status) {
      case 'uploading': {
        setLoading(true);
        return;
      }
      case 'done': {
        const fileId = _.get(file, 'response.id');
        const fileName = _.get(file, 'response.fileName');
        if (fileId) {
          updateDocList([...docList, { fileId, fileName }]);
        }
      }
      default: {
        setLoading(false);
        break;
      }
    }
  };

  const updateDocList = (updatedDocList) => {
    setDocList(updatedDocList);
    onChange(updatedDocList);
  }

  const handleDeleteDoc = doc => {
    Modal.confirm({
      title: <>Delete <Text strong>{doc.fileName}</Text></>,
      icon: <QuestionCircleOutlined danger />,
      closable: true,
      maskClosable: true,
      okText: 'Yes, Delete',
      okButtonProps: {
        danger: true
      },
      onOk: () => {
        const updatedDocList = docList.filter(d => d !== doc)
        updateDocList(updatedDocList);
      }
    });
  }

  const handleGenDocDone = (generatedDoc) => {
    if (docTemplateId) {
      updateDocList(docList.map(d => d.docTemplateId === docTemplateId ? generatedDoc : d));
    } else {
      updateDocList([...docList, generatedDoc])
    }
    setGenDocModalVisible(false);
  }

  const showGenDocModalSpecific = (docTemplateId) => {
    if (!docTemplateId) throw new Error('docTemplateId is not specified');
    setDocTemplateId(docTemplateId);
    setGenDocModalVisible(true);
  }

  const showGenDocModalAny = () => {
    setDocTemplateId(null);
    setGenDocModalVisible(true);
  }

  const toggleRequiresSign = (doc) => {
    doc.requiresSign = !doc.requiresSign;
    updateDocList([...docList]);
  }

  const toggleIsFeedback = (doc) => {
    doc.isFeedback = !doc.isFeedback;
    updateDocList([...docList]);
  }

  const columns = [
    {
      title: 'Document',
      dataIndex: 'fileId',
      render: (fileId, doc) => fileId ? <FileLink id={fileId} name={doc.fileName} /> :
        <Tooltip title="Generate from the doc template">
          <PendingDoc>
            <Space style={{ width: '100%', alignItems: 'center' }} onClick={() => showGenDocModalSpecific(doc.docTemplateId)}>
              <FileIcon name={doc.fileName} />
              {doc.fileName}
              <Tag icon={<ExclamationCircleOutlined />} color="warning">Pending doc template. Click to generate!</Tag>
            </Space>
          </PendingDoc>
        </Tooltip>
    },
    {
      title: 'Last Read At',
      dataIndex: 'lastReadAt',
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Signed At',
      dataIndex: 'signedAt',
      render: (value) => value ? <TimeAgo value={value} /> : null
    },
    {
      // title: 'Action',
      render: (value, doc) => <Space >
        <Tooltip title={doc.requiresSign ? 'Revoke sign request' : 'Requires sign'}>
          <Button type="link" type={doc.requiresSign ? 'primary' : 'secondary'} onClick={() => toggleRequiresSign(doc)} icon={<HighlightOutlined />} disabled={!doc.fileId || doc.signedAt}></Button>
        </Tooltip>
        <Tooltip title={`${doc.isFeedback ? 'Exclude from' : 'Include into'} feedback documents`}>
          <Button type="link" type={doc.isFeedback ? 'primary' : 'secondary'} onClick={() => toggleIsFeedback(doc)} icon={<FlagOutlined />} disabled={!doc.fileId}></Button>
        </Tooltip>
        <Tooltip title="Delete document">
          <Button type="link" onClick={() => handleDeleteDoc(doc)} danger icon={<DeleteOutlined />}></Button>
        </Tooltip>
      </Space>
    },
  ];

  let rowKey = 0;

  return (
    <Container className="clearfix">
      <Space style={{ width: '100%', margin: '1rem auto', justifyContent: 'flex-end' }}>
        <Button type="primary" ghost disabled={loading} icon={<FileAddOutlined />} onClick={() => showGenDocModalAny()}>Add from Doc Template</Button>
        <Upload
          multiple={true}
          action={`${process.env.REACT_APP_FLN_API_ENDPOINT}/file`}
          withCredentials={true}
          accept="*/*"
          // fileList={docList}
          onChange={handleChange}
          showUploadList={false}
          disabled={loading}
        >
          <Button type="primary" ghost disabled={loading} icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Space>
      {/* <Text code style={{ whiteSpace: 'pre-line' }}>{JSON.stringify(docList, null, 2)}</Text> */}
      <Table
        columns={columns}
        size="small"
        dataSource={docList}
        pagination={false}
        loading={loading}
        rowKey={() => rowKey++}
      />
      <GenDocStepperModal
        visible={genDocModalVisible}
        fields={fields}
        onChange={handleGenDocDone}
        docTemplateId={docTemplateId}
        onCancel={() => setGenDocModalVisible(false)}
      />
    </Container>
  );

}

TaskDocEditor.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any),
  disabled: PropTypes.bool,
};

TaskDocEditor.defaultProps = {
  disabled: false,
};
