import React from 'react';
import { Card, Switch, Row, Input, Form, Col, Select, Space, Typography, Button } from 'antd';
import Icon, { CloseOutlined, DeleteFilled, DeleteOutlined } from '@ant-design/icons'
import RenderOptions from './RenderOptions';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';

const { Text } = Typography;

const FieldEditCard = (props) => {
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
      extra={<Button size="small" icon={<CloseOutlined />} danger type="link" onClick={() => onDelete(value)}></Button>}
    >
      <Row gutter={32}>
        <Col span={14}>
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
        <Col span={10}>
          <Form.Item label="Type"
            name={['fields', index, 'type']}
            rules={[{ required: true, message: ' ' }]}>
            <Select style={{ maxWidth: 240 }} >
              {TaskTemplateWidgetDef.map((d, i) => <Select.Option key={i} value={d.type}>
                <Icon component={() => d.icon} />
                <span style={{ marginLeft: 10 }}>{d.label}</span>
              </Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Required" valuePropName="checked" name={['fields', index, 'required']} >
            <Switch />
          </Form.Item>
          {['radio', 'checkbox', 'select'].includes(value.type) &&
            <RenderOptions type={value.type} fieldIndex={index} options={value.options} onChange={handleOptionChange} />
          }
        </Col>
      </Row>
    </Card>
  );
};

FieldEditCard.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  items: PropTypes.array.isRequired,
};

FieldEditCard.defaultProps = {
};

export default FieldEditCard;