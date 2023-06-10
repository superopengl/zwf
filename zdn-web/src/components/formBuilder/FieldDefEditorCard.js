import React from 'react';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import { Card, Switch, Row, Input, Form, Col, Select, Space } from 'antd';
import Icon, { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { find } from 'lodash';
import {
  FaTextWidth,
  FaAlignLeft,
  FaCheckSquare,
  FaChevronCircleDown,
  FaDotCircle,
  FaCheck,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';
import RenderOptions from './RenderOptions';

const DragHandle = sortableHandle(() => (
  <Row className="drag-handle" type="flex" align="middle" justify="center">
    <span>:::</span>
  </Row>
));

const getRule = rules => {
  let required = false;
  if (rules && rules.length)
    required = find(rules, r => r.required === true || r.required === false);
  return required;
};

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
      title={<DragHandle />}
      style={{ width: '100%' }}
      extra={<Space>
        <DeleteOutlined
          onClick={() => {
            if (onDelete) onDelete(value);
          }}
        />
      </Space>}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item required label="Field name">
            <Input
              value={value.label || ''}
              placeholder="Add Question Here"
              onChange={e => {
                handleChange('label', e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              placeholder="Add description"
              value={value.description || ''}
              autosize={{ minRows: 2, maxRows: 6 }}
              onChange={e => {
                handleChange('description', e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <RenderOptions value={value} onChange={handleOptionChange} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item required label="Type">
            <Select
              value={value.type || ''}
              style={{ width: 250 }}
              onSelect={selectedType => {
                // On change, reset.
                value.type = selectedType;
                value.options = ['checkbox', 'radio', 'select'].includes(selectedType) ? (value.options ?? []) : [];
                onChange([...items]);
              }}
            >
              <Select.Option key="input" value="input">
                <Icon component={() => <FaTextWidth />} />
                <span style={{ marginLeft: 10 }}>Text</span>
              </Select.Option>
              <Select.Option key="textarea" value="textarea">
                <Icon component={() => <FaAlignLeft />} />
                <span style={{ marginLeft: 10 }}>Paragraph (multiple lines)</span>
              </Select.Option>
              <Select.Option key="upload" value="upload">
                <UploadOutlined />
                <span style={{ marginLeft: 10 }}>Upload</span>
              </Select.Option>
              <Select.Option key="radio" value="radio">
                <Icon component={() => <FaDotCircle />} />
                <span style={{ marginLeft: 10 }}>Multiple choice</span>
              </Select.Option>
              <Select.Option key="checkbox" value="checkbox">
                <Icon component={() => <FaCheckSquare />} />
                <span style={{ marginLeft: 10 }}>Checkboxes</span>
              </Select.Option>
              <Select.Option key="select" value="select">
                <Icon component={() => <FaChevronCircleDown />} />
                <span style={{ marginLeft: 10 }}>Dropdown</span>
              </Select.Option>
              <Select.Option key="date" value="date">
                <Icon component={() => <FaCalendarAlt />} />
                <span style={{ marginLeft: 10 }}>Date</span>
              </Select.Option>
              <Select.Option key="month" value="month">
                <Icon component={() => <FaCalendarAlt />} />
                <span style={{ marginLeft: 10 }}>Month</span>
              </Select.Option>
              <Select.Option key="quarter" value="quarter">
                <Icon component={() => <FaCalendarAlt />} />
                <span style={{ marginLeft: 10 }}>Quarter</span>
              </Select.Option>
              <Select.Option key="year" value="year">
                <Icon component={() => <FaCalendarAlt />} />
                <span style={{ marginLeft: 10 }}>Year</span>
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Required">
            <Switch
              checked={value.required}
              onChange={checked => {
                value.required = checked;
                onChange([...items]);
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default FieldDefEditorCard;