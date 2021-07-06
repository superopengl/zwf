import React, { useState } from 'react';
import { Radio, Button, Checkbox, Input, Col, Row, Form, Typography } from 'antd';
import { filter, uniq } from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
const { Text } = Typography;

const Container = styled.div`
padding: 10px;
// border: 1px solid rgba(0,0,0,0.1);
// border-radius: 4px;
`;

const RenderOptions = (props) => {

  const { type, options: propOptions, fieldIndex, onChange } = props;
  const [options, setOptions] = React.useState(propOptions || []);

  React.useEffect(() => {
    setOptions(propOptions || [])
  }, [propOptions])

  const handleOptionsChange = (newOptions) => {
    const sanitizedOptions = uniq(newOptions.filter(x => x));
    onChange(sanitizedOptions);
  }

  return (
    <Container>
      {options.map((option, index) => {
        return (
          <Row key={index} justify="start" align="top" style={{ marginBottom: 10 }}>
            <Col flex="24px">
              <div style={{ position: 'relative', top: 4 }}>
                {type === 'radio' && <Radio disabled></Radio>}
                {type === 'checkbox' && <Checkbox disabled />}
                {type === 'select' && <Text type="secondary"><small>{index + 1}</small></Text>}
              </div>
            </Col>
            <Col flex="auto">
              <Form.Item noStyle name={['fields', fieldIndex, 'options', index]} rules={[{ required: true, message: ' ' }]}>
                <Input
                  // value={option}
                  // autoFocus
                  style={{
                    width: '100%',
                  }}
                // onBlur={e => {
                //   handleOptionsChange(options);
                // }}
                // onChange={e => {
                //   options[index] = e.target.value;
                //   setOptions([...options]);
                // }}
                />
              </Form.Item>
            </Col>
            <Col>
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
        );
      })}
      <Row>
        <Col flex="24px" />
        <Col flex="auto">
          <Button
            type="primary"
            block
            ghost
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
        <Col flex="32px" />
      </Row>

    </Container>
  );
};

RenderOptions.propTypes = {
  type: PropTypes.oneOf(['checkbox', 'radio', 'select']).isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  fieldIndex: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

RenderOptions.defaultProps = {
};

export default RenderOptions;