import React, { useState } from 'react';
import { Radio, Button, Checkbox, Input, Col, Row } from 'antd';
import { filter, uniq } from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';

const RenderOptions = ({ type, options: propOptions, onChange }) => {

  const [options, setOptions] = React.useState(propOptions || []);

  React.useEffect(() => {
    setOptions(propOptions || [])
  }, [propOptions])

  const addNewButton = (
    <Button
      type="ghost"
      size="small"
      style={{ marginTop: 10 }}
      onClick={() => {
        const newOptions = [
          ...options,
          {
            value: `Option ${options.length + 1}`,
            label: `Option ${options.length + 1}`,
          },
        ];
        handleOptionsChange(newOptions);
      }}
    >
      Add option
    </Button>
  );

  const handleOptionsChange = (newOptions) => {
    const sanitizedOptions = uniq(newOptions.filter(x => x.value), x => x.value);
    onChange(sanitizedOptions);
  }

  return (
    <div>
      {options.map((option, index) => {
        return (
          <div style={{ marginTop: '5px' }} key={index}>
            <Row type="flex" justify="start" align="middle" gutter={16}>
              <Col span={1}>
                {type === 'radio' && <Radio disabled />}
                {type === 'checkbox' && <Checkbox disabled />}
                {type === 'select' && <span>{index + 1}</span>}
              </Col>
              <Col span={10}>
                <Input
                  value={option.value}
                  // autoFocus
                  style={{
                    width: '100%',
                  }}
                  onBlur={e => {
                    handleOptionsChange(options);
                  }}
                  onChange={e => {
                    const optionValue = e.target.value;
                    options[index] = {
                      label: optionValue,
                      value: optionValue
                    };
                    setOptions([...options]);
                  }}
                />
              </Col>
              <Col span={1}>
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => {
                    options.splice(index, 1);
                    handleOptionsChange(options);
                  }}
                />
              </Col>
            </Row>
          </div>
        );
      })}
      {['checkbox', 'radio', 'select'].includes(type) && addNewButton}
    </div>
  );
};

export default RenderOptions;