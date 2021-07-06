import React from 'react';
import { Card, Switch, Row, Input, Form, Col, Select, Space, Typography, Button } from 'antd';
import Icon, { DeleteFilled, DeleteOutlined } from '@ant-design/icons'
import RenderOptions from './RenderOptions';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';

const {Text} = Typography;

const FieldDefEditorCard = (props) => {
  const { value, index, items, onDelete, onChange } = props;

  // Bubble up changes to parent.
  const handleChange = (field = '', change) => {
    // Updated schema with changes.
    const allFields = items;
    // Update specific property.
    if (field) {
      allFields[index] = { ...value, [field]: change };
    } else {
      // replace property
      allFields[index] = { ...change };
    }
    if (onChange) onChange([...allFields]);
  };

  const handleOptionChange = change => {
    handleChange('options', change);
  };

  return (
    <Card
      size="small"
      title={<Row className="drag-handle" type="flex" align="middle" justify="center">
      <Text type="secondary">:::</Text>
    </Row>}
      type="inner"
      style={{ width: '100%' }}
      extra={<Button size="small" icon={<DeleteFilled/>} danger type="link" onClick={() => onDelete(value)}></Button>}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Field name"
            name={['fields', index, 'name']}
            rules={[{ required: true, whitespace: true, message: ' ', max: 50 }]}>
            <Input placeholder="" />
          </Form.Item>
          <Form.Item label="Description"
            name={['fields', index, 'description']}
            rules={[{ required: false, whitespace: true, message: ' ', max: 300 }]}>
            <Input.TextArea
              placeholder="Add description"
              autosize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Type"
            name={['fields', index, 'type']}
            rules={[{ required: true, message: ' ' }]}>
            <Select style={{ width: 250 }}
            // onSelect={selectedType => {
            //   // On change, reset.
            //   debugger;
            //   value.type = selectedType;
            //   value.options = ['checkbox', 'radio', 'select'].includes(selectedType) ? (value.options ?? []) : undefined;
            //   onChange([...items]);
            // }}
            >
              {TaskTemplateWidgetDef.map((d, i) => <Select.Option key={i} value={d.type}>
                <Icon component={() => d.icon} />
                <span style={{ marginLeft: 10 }}>{d.label}</span>
              </Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Required" valuePropName="checked" name={['fields', index, 'required']} >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={24}>
            <RenderOptions type={value.type} options={value.options} onChange={handleOptionChange} />
        </Col>
      </Row>
    </Card>
  );
};

export default FieldDefEditorCard;