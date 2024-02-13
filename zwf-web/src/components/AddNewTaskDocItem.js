import React from 'react';
import { Typography, Space } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const AddNewTaskDocItem = React.memo(props => {
  return <Space size="small" align="start" style={{ width: '100%', lineHeight: 1.4 }}>
    <UploadOutlined style={{ fontSize: 30, color: '#37AFD2' }} />
    <div>
      <Text type="secondary">Click or drag file to this area to upload</Text>
      <div><Text type="secondary"><small>Support for single or bulk file upload. Maximumn 20MB per file.</small></Text></div>
    </div>
  </Space>
});


