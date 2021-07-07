import React from 'react';
import { Card, Switch, Row, Input, Form, Col, Select, Tooltip, Typography, Button } from 'antd';
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

  const formItemLayoutProps = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  }

  return (
    <Card
      size="small"
      title={<Row type="flex" align="middle" justify="space-between">
        <Text type="secondary">{index + 1}</Text>
        <Text type="secondary"><big>:::</big></Text>
        <Tooltip title="Delete field" placement="topRight">
          <Button size="small" icon={<DeleteFilled />} danger type="link" onClick={() => onDelete(value)}></Button>
          </Tooltip>
      </Row>}
      type="inner"
      style={{ width: '100%' }}
    >
      <Row gutter={32}>
        <Col flex="auto">
          <Form.Item label="Field name"
            {...formItemLayoutProps}
            name={['fields', index, 'name']}
            rules={[{ required: true, whitespace: true, message: ' ', max: 50 }]}>
            <Input placeholder="" allowClear maxLength={100}/>
          </Form.Item>
          <Form.Item label="Description"
            {...formItemLayoutProps}
            name={['fields', index, 'description']}
            rules={[{ required: false, whitespace: true, message: ' ', max: 300 }]}>
            <Input.TextArea
              placeholder="Add description"
              maxLength={1000}
              showCount
              allowClear
              autosize={{ minRows: 3, maxRows: 20 }}
            />
          </Form.Item>
          {['radio', 'checkbox', 'select'].includes(value.type) &&
            <Form.Item label="Options" required
              {...formItemLayoutProps}>
              <RenderOptions type={value.type} fieldIndex={index} options={value.options} onChange={handleOptionChange} />
            </Form.Item>
          }
        </Col>
        <Col flex="auto">
          <Form.Item label="Type"
            {...formItemLayoutProps}
            name={['fields', index, 'type']}
            rules={[{ required: true, message: ' ' }]}>
            <Select style={{ maxWidth: 240 }} >
              {TaskTemplateWidgetDef.map((d, i) => <Select.Option key={i} value={d.type}>
                <Icon component={() => d.icon} />
                <span style={{ marginLeft: 10 }}>{d.label}</span>
              </Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Required"
            {...formItemLayoutProps}
            valuePropName="checked" name={['fields', index, 'required']} >
            <Switch />
          </Form.Item>
          <Form.Item label="Official only"
            {...formItemLayoutProps}
            valuePropName="checked" name={['fields', index, 'official']} >
            <Switch />
          </Form.Item>
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