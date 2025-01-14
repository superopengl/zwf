import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Card, Tooltip, Form, Switch, Input, Button, Modal, Typography, Space } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

const { Text, Title, Paragraph } = Typography;


export const FieldEditPanel = (props) => {
  const { field, onChange, trigger, children, onDelete, open, ...others } = props;
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDeleting(false);
    }
  }, [open])

  const handleValuesChange = (changedValues, allValues) => {
    onChange(allValues);
  }

  const handleDeleteField = () => {
    setDeleting(true);
  };

  return <Tooltip
    {...others}
    open={open}
    placement="rightTop"
    color="white"
    trigger={trigger}
    overlayInnerStyle={{width: 300}}
    title={<div style={{ padding: '1rem' }}>
      {deleting ? <>
        <Paragraph><Text type="danger"><DeleteOutlined /></Text> Are you sure you want to delete field <Text strong>{field.name}</Text>?</Paragraph>
        <Space style={{width: '100%', justifyContent: 'end'}}>
          <Button type="text" autoFocus onClick={() => setDeleting(false)}>Cancel</Button>
          <Button type="primary" danger onClick={onDelete}>Yes, delete</Button>
        </Space>
      </> : <><Form
        layout="vertical"
        initialValues={field}
        onValuesChange={handleValuesChange}
        autoComplete="off"
      >
        <Form.Item name="name" label="Field Name" valuePropName="checked" required>
          <Input allowClear />
        </Form.Item>
        <Form.Item name="required" label="Required" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="official" label="Official only" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="description" label="Description" valuePropName="checked">
          <Input.TextArea allowClear showCount maxLength={200} autoSize={{ minRows: 3 }} />
        </Form.Item>
      </Form>
        <Button danger block type="primary" icon={<DeleteOutlined />} onClick={handleDeleteField}>Delete field</Button>
      </>
      }
    </div>}
  >
    {children}
  </Tooltip>
}


FieldEditPanel.propTypes = {
  field: PropTypes.object,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  trigger: PropTypes.oneOf(['hover', 'click']),
};

FieldEditPanel.defaultProps = {
  field: {},
  onChange: () => { },
  onDelete: () => { },
  trigger: 'click'
};