import React from 'react';
import { Modal, Space, Row, Button } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { TagSelect } from './TagSelect';

const Content = props => {
  const { value: propValue, onChange } = props;
  const [value, setValue] = React.useState(propValue);

  return <Space style={{ width: '100%' }} direction="vertical" size="large">
    <TagSelect value={value} onChange={setValue} style={{ width: '100%' }} />
    <Row justify="end">
      <Button type="primary" onClick={() => onChange(value)}>Save</Button>
    </Row>
  </Space>
}

export function showSetTagsModal(value, onChange) {
  const modalRef = Modal.info({
    title: <>Set tags</>,
    content: <Content value={value} onChange={newValue => {
      onChange(newValue, () => modalRef.destroy());
    }} />,
    afterClose: () => {
    },
    icon: <TagsOutlined />,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    focusTriggerAfterClose: true,
    okButtonProps: {
      style: {
        display: 'none'
      }
    },
  });

  return modalRef;
}
