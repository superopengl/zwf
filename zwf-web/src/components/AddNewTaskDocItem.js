import React from 'react';
import { Typography, Space, List } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const AddNewTaskDocItem = React.memo(props => {
  return <List.Item>
    <List.Item.Meta 
      avatar={<UploadOutlined style={{ fontSize: 30, color: '#37AFD2' }} />}
      title={<Text type="secondary">Click or drag file to this area to upload</Text>}
      description="Support for single or bulk file upload. Maximumn 20MB per file."
    />
  </List.Item>

});


