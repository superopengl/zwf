import React from 'react';
import { Typography, Space } from 'antd';
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const AddFromDocTemplateItem = React.memo(props => {
  return <Space size="small" align="start" style={{ width: '100%', lineHeight: 1.4 }}>
    <PlusOutlined style={{ fontSize: 30, color: '#37AFD2' }} />
    <div>
      <Text type="secondary">Add doc template</Text>
      <div><Text type="secondary"><small>The doc can be filled by filed values and generated on demand.</small></Text></div>
    </div>
  </Space>
});


