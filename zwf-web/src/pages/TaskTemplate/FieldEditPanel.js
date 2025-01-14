import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Card, Tooltip, Form, Switch, Input, Button } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';


export const FieldEditPanel = (props) => {
  const { field, onChange, trigger, children, ...others } = props;

  const handleValuesChange = (changedValues, allValues) => {
    onChange(allValues);
  }

  return <Tooltip
    {...others}
    placement="rightTop"
    color="white"
    trigger={trigger}
    mouseEnterDelay={0}
    mouseLeaveDelay={0}
    title={<div style={{ padding: '1rem' }}>
      <Form
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
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
      <Button key="delete" danger block type="primary" icon={<DeleteOutlined />}>Delete field</Button>

    </div>}
  >
    {children}
  </Tooltip>
}


FieldEditPanel.propTypes = {
  field: PropTypes.object,
  onChange: PropTypes.func,
  trigger: PropTypes.oneOf(['hover', 'click']),
};

FieldEditPanel.defaultProps = {
  field: {},
  onChange: () => { },
  trigger: 'click'
};