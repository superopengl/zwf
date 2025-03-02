import React, { useState } from 'react';
import { Radio, Button, Tooltip, Input, Col, Row, Form, Typography } from 'antd';
import { filter, uniq } from 'lodash';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
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
    handleOptionsChange(options);
  }

  return (
    <Container>
      {options.map((option, index) => {
        return (
          <Row key={index} justify="start" align="top" style={{ marginBottom: 16 }}>
            {/* <Col flex="24px">
              <div style={{ position: 'relative', top: 4 }}>
                {type === 'radio' && <Radio disabled></Radio>}
                {type === 'checkbox' && <Checkbox disabled />}
                {type === 'select' && <Text type="secondary"><small>{index + 1}</small></Text>}
              </div>
            </Col> */}
            <Col flex="auto">
                <Input autoFocus maxLength={100} value={option} onChange={e => handleOptionTextChange(e.target.value, index)}/>
            </Col>
            <Col>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
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
        <Col flex="24px" />
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
