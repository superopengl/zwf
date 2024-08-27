import React from 'react';
import { Typography, Space, List } from 'antd';
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const AddFromDocTemplateItem = React.memo(props => {
  return <List.Item onClick={e => {
    e.stopPropagation();
    props.onClick();
  }}>
    <List.Item.Meta
      avatar={<PlusOutlined style={{ fontSize: 30, color: '#0FBFC4' }} />}
      title={<Text type="secondary">Add doc template</Text>}
      description="The doc can be filled by filed values and generated on demand."
    />
  </List.Item>
});


