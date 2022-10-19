import React from 'react';
import styled from 'styled-components';

import { Steps, Button, Form, Input, Typography } from 'antd';
import { isValidABN } from "abnacn-validator";
import { createMyOrg$, getMyOrgProfile$, saveMyOrgProfile$ } from 'services/orgService';
import PropTypes from 'prop-types';
import { CountrySelector } from 'components/CountrySelector';

const { Step } = Steps;
const { Text } = Typography;

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  text-align: left;
  // background-color: #f3f3f3;

  .ant-form-item {
    margin-bottom: 2rem;
  }
`;

const InnerContainer = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  // background-color: #f3f3f3;
`;

const DEFAULT_PROFILE = {
  country: 'AU',
}

const OrgProfileForm = (props) => {

  const [basicForm] = Form.useForm();
  const [org, setOrg] = React.useState(DEFAULT_PROFILE);
  const [requireAbn, setRequireAbn] = React.useState(true);

  React.useEffect(() => {
    getMyOrgProfile$()
      .subscribe(org => {
        setOrg({
          ...DEFAULT_PROFILE,
          ...org
        });
      });
  }, []);

  React.useEffect(() => {
    basicForm.resetFields();
  }, [org]);

  const handleSubmitBasic = values => {
    const source$ = props.mode === 'create' ? createMyOrg$(values) : saveMyOrgProfile$(values);
    source$.subscribe(() => props.onOk())
  }

  const handleValuesChange = (changedValues, allValues) => {
    const { country } = changedValues;
    if (country) {
      setRequireAbn(country === 'AU');
    }
  }

  return <Container>
    <Form layout="vertical" form={basicForm}
      onValuesChange={handleValuesChange}
      onFinish={handleSubmitBasic}
      style={{ textAlign: 'left' }}
      initialValues={org}>
      <Form.Item label="Organization name"
        name="name"
        help={<>The name of your organisation in ZeeWorkflow. Not necessarily the same as the legal name. The name will show up on some pages.</>}
        rules={[{ required: true, message: ' ', whitespace: true, max: 50 }]}>
        <Input allowClear={true} placeholder="ZeeWorkflow" autoComplete="organization" />
      </Form.Item>

      <Form.Item label="Organization legal name"
        name="businessName"
        help={<>The leagal name of your organisation. This name will be used in invoices and as the recipient name of certian notification emails.</>}
        rules={[{ required: true, message: ' ', whitespace: true, max: 100 }]}>
        <Input placeholder="ZeeWorkflow Inc." allowClear={true} autoComplete="organization" />
      </Form.Item>
      <Form.Item label="Organization registration country" name="country" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <CountrySelector defaultValue="AU" />
      </Form.Item>
      {requireAbn && <Form.Item label="ABN"
        name="abn"
        rules={[{ required: true, validator: (rule, value) => value && isValidABN(value) ? Promise.resolve() : Promise.reject('Invalid ABN') }]}>
        <Input placeholder="" allowClear={true} maxLength={20} />
      </Form.Item>}
      <Form.Item label="Address"
        name="address"
        rules={[{ required: false, message: ' ', whitespace: true, max: 100 }]}>
        <Input placeholder="Unit 123, God Avenue, NSW 1234" allowClear={true} autoComplete="street-address" />
      </Form.Item>
      <Form.Item label="Phone"
        name="tel"
        rules={[{ required: false, message: ' ', whitespace: true, max: 30 }]}>
        <Input placeholder="" allowClear={true} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" block htmlType="submit">Save</Button>
      </Form.Item>
    </Form>
  </Container>

}

OrgProfileForm.propTypes = {
  onOk: PropTypes.func,
  mode: PropTypes.oneOf(['create', 'update'])
};

OrgProfileForm.defaultProps = {
  onOk: () => { },
  mode: 'update'
};

export default OrgProfileForm;
