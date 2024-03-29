import React, { useState } from 'react';
import { Radio, Button, Tooltip, Input, Col, Row, Form, Typography } from 'antd';
import { filter, uniq } from 'lodash';
import { CloseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
const { Text } = Typography;

const Container = styled.div`
padding: 16px;
border: 1px solid rgb(217,217,217);
background-color: rgb(250,250,250);
border-radius: 4px;
`;

export const OptionsBuilder = (props) => {

  const { value, onChange } = props;
  const [options, setOptions] = React.useState(value || []);

  React.useEffect(() => {
    setOptions(value || [])
  }, [value])

  const handleOptionsChange = (newOptions) => {
    const sanitizedOptions = uniq(newOptions.filter(x => x));
    onChange(sanitizedOptions);
  }

  const handleOptionTextChange = (value, index) => {
    options[index] = value?.trim();
    setOptions([...options]);
  }

  const handleChange = (value, index) => {
    handleOptionsChange(options);
  }

  return (
    <Container>
      {options.map((option, index) => {
        return (
          <Row key={index} justify="start" align="top" gutter={4} style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <Input autoFocus maxLength={100} value={option}
                onChange={e => handleOptionTextChange(e.target.value, index)}
                onPressEnter={e => handleChange(e.target.value, index)}
                onBlur={e => handleChange(e.target.value, index)}
              />
            </Col>
            <Col>
              <Button
                type="text"
                size="small"
                icon={<MinusCircleOutlined />}
                danger
                style={{ position: 'relative', top: 4 }}
                onClick={() => {
                  options.splice(index, 1);
                  handleOptionsChange(options);
                }}
              />
            </Col>
          </Row>
        );
      })}
      <Row>
        {/* <Col flex="24px" /> */}
        <Col flex="auto">
          <Button
            block
            type="primary"
            ghost
            icon={<PlusOutlined/>}
            onClick={() => {
              const newOptions = [
                ...options,
                `Option ${options.length + 1}`,
              ];
              handleOptionsChange(newOptions);
            }}
          >
            Add option
          </Button>
        </Col>
        {/* <Col flex="28px" /> */}
      </Row>
    </Container>
  );
};

OptionsBuilder.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};

OptionsBuilder.defaultProps = {
};
