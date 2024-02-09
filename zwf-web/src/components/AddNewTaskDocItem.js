import React from 'react';
import { Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const AddNewTaskDocItem = React.memo(props => {
  return <Space size="small" align="start" style={{ width: '100%', lineHeight: 1.4 }}>
    <PlusOutlined style={{ fontSize: 30 }} />
    <div>
      <Text type="secondary">Click or drag file to this area to upload</Text>
      <div><Text type="secondary"><small>Support for single or bulk file upload. Maximumn 20MB per file.</small></Text></div>
    </div>
  </Space>
});


