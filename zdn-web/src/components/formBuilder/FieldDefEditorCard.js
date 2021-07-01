import React from 'react';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import { Card, Switch, Row, Input, Form, Col, Select } from 'antd';
import Icon, { UploadOutlined } from '@ant-design/icons'
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
  const { value: { index, items, ...value }, onDelete, onChange } = props;
  // Bubble up changes to parent.
  const handleChange = (field = '', change) => {
    // Updated schema with changes.
    const allFields = items;
    // Update specific property.
    if (field) {
      allFields[index] = { ...value, [field]: change };
    } else {
      // replace property
      allFields[index] = { ...change, field: value.field };
    }
    if (onChange) onChange(allFields);
  };

  const handleOptionChange = change => {
    handleChange('options', change);
  };

  return (
    <Row type="flex" style={{ zIndex: 1000, margin: 10 }}>
      <Card
        title={<DragHandle />}
        style={{ width: '100%' }}
        actions={[
          <Icon
            type="delete"
            key="delete"
            onClick={() => {
              if (onDelete) onDelete(value);
            }}
          />,

          <Switch
            checkedChildren="Required"
            unCheckedChildren="Not required"
            checked={getRule(value.rules).required}
            onChange={checked => {
              if (value && value.rules && value.rules.length) {
                const ruleIndex = value.rules.indexOf(getRule(value.rules));
                if (ruleIndex > -1) {
                  // Copy previous rule.
                  const updatedRules = value.rules;
                  // Update rule
                  updatedRules[ruleIndex].required = checked;
                  updatedRules[ruleIndex].message = 'Field is required';
                  handleChange('schema', updatedRules);
                }
              }
            }}
          />,
          <Icon type="ellipsis" key="ellipsis" />,
        ]}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item required label="Field">
              {value && value.type === 'textarea' ? (
                <Input.TextArea
                  placeholder="Add field"
                  value={value.label || ''}
                  autosize={{ minRows: 2, maxRows: 6 }}
                  onChange={e => {
                    handleChange('label', e.target.value);
                  }}
                />
              ) : (
                <Input
                  value={value.label || ''}
                  placeholder="Add Question Here"
                  onChange={e => {
                    handleChange('label', e.target.value);
                  }}
                />
              )}
            </Form.Item>

            <Form.Item>
              <RenderOptions value={value} onChange={handleOptionChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Row>
              <Form.Item required label="Type">
                <Select
                  value={value.type || ''}
                  style={{ width: 250 }}
                  onSelect={selected => {
                    // On change, reset.
                    const newField = {
                      label: value.label || ``,
                      placeholder: 'Add Question Here',
                      field: value.field,
                      type: selected,
                      rules: [
                        { required: false, message: 'Field is required' },
                      ],
                    };
                    if (
                      selected === 'checkbox' ||
                      selected === 'radio' ||
                      selected === 'select'
                    ) {
                      newField.options = [];
                    }
                    handleChange('', newField);
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
            </Row>
          </Col>
        </Row>
      </Card>
    </Row>
  );
};

export default FieldDefEditorCard;