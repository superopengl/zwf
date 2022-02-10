import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import SignUpForm from 'components/SignUpForm';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import { Steps, Button, message, Space, Alert, Form, Input, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { isValidABN, isValidACN } from "abnacn-validator";
import * as tfn from 'tfn';
import { getMyOrgProfile$, saveMyOrgProfile$ } from 'services/orgService';
import { Loading } from 'components/Loading';

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

  .ant-form-item-explain {
    margin-bottom: 2rem;
  }
`;

const InnerContainer = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  // background-color: #f3f3f3;
`;


const OrgOnBoardWizard = (props) => {
  const [current, setCurrent] = React.useState(0);
  const [basicForm] = Form.useForm();
  const [configForm] = Form.useForm();
  const [org, setOrg] = React.useState();

  React.useEffect(() => {
    getMyOrgProfile$()
      .subscribe(org => {
        setOrg(org);
      });
  }, []);

  React.useEffect(() => {
    basicForm.resetFields();
  }, [org]);

  const nextStep = async () => {
    if (current === 0) {
      try {
        await basicForm.validateFields()
        basicForm.submit();
      } catch (err) {
        // form validation errors;
      }
    }
    // setCurrent(current + 1);
  };

  const prevStep = () => {
    setCurrent(current - 1);
  };

  const handleSubmitBasic = values => {
    saveMyOrgProfile$(values).subscribe(
      () => {
        setCurrent(current + 1);
      })
  }

  const handleSubmitConfig = values => {
  }

  const steps = [
    {
      title: 'Basic Info',
      content: <Form layout="vertical" form={basicForm} onFinish={handleSubmitBasic} style={{ textAlign: 'left' }} initialValues={org}>
        <Form.Item label="Organization name"
          name="name"
          help={<>The name of your organisation in ZeeWorkFlow. Not necessarily the same as the legal name. The name will show up on some pages.</>}
          rules={[{ required: true, message: ' ', whitespace: true, max: 50 }]}>
          <Input allowClear={true} placeholder="ZeeWorkFlow" autoComplete="organization" />
        </Form.Item>
        <Form.Item label="Domain name"
          name="domain"
          help={<>This domain name will be used to generate email sender addresses like <Text code>noreply@zeeworkflow.com</Text>.</>}
          rules={[{ required: true, message: ' ', whitespace: true, max: 100 }]}>
          <Input placeholder="zeeworkflow.com" allowClear={true} />
        </Form.Item>
        <Form.Item label="Business legal name"
          name="businessName"
          help={<>The leagal name of your organisation. This name will be used in invoices and as the recipient name of certian notification emails.</>}
          rules={[{ required: true, message: ' ', whitespace: true, max: 100 }]}>
          <Input placeholder="ZeeWorkFlow Inc." allowClear={true} autoComplete="organization" />
        </Form.Item>
        <Form.Item label="ABN"
          name="abn"
          rules={[{ required: true, validator: (rule, value) => value && isValidABN(value) ? Promise.resolve() : Promise.reject('Invalid ABN') }]}>
          <Input placeholder="" allowClear={true} maxLength={20} />
        </Form.Item>
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
      </Form>,
    },
    {
      title: 'Payment',
      content: <div>
        <Form layout="vertical" form={configForm} onFinish={handleSubmitConfig} style={{ textAlign: 'left' }} initialValues={org}>
      <Form.Item label="Organization name"
        name="name"
        help={<>The name of your organisation in ZeeWorkFlow. Not necessarily the same as the legal name. The name will show up on some pages.</>}
        rules={[{ required: true, message: ' ', whitespace: true, max: 50 }]}>
        <Input allowClear={true} placeholder="ZeeWorkFlow" autoComplete="organization" />
      </Form.Item>
      <Form.Item label="Domain name"
        name="domain"
        help={<>This domain name will be used to generate email sender addresses like <Text code>noreply@zeeworkflow.com</Text>.</>}
        rules={[{ required: true, message: ' ', whitespace: true, max: 100 }]}>
        <Input placeholder="zeeworkflow.com" allowClear={true} />
      </Form.Item>
      <Form.Item label="Business legal name"
        name="businessName"
        help={<>The leagal name of your organisation. This name will be used in invoices and as the recipient name of certian notification emails.</>}
        rules={[{ required: true, message: ' ', whitespace: true, max: 100 }]}>
        <Input placeholder="ZeeWorkFlow Inc." allowClear={true} autoComplete="organization" />
      </Form.Item>
      <Form.Item label="ABN"
        name="abn"
        rules={[{ required: true, validator: (rule, value) => value && isValidABN(value) ? Promise.resolve() : Promise.reject('Invalid ABN') }]}>
        <Input placeholder="" allowClear={true} maxLength={20} />
      </Form.Item>
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
    </Form>
    </div>,
    },
  ];

  return <Container>
    <Steps current={current} size="small">
      {steps.map(item => (
        <Step key={item.title} title={item.title} />
      ))}
    </Steps>
    <div style={{ padding: '30px 0' }}>
      {steps[current].content}
    </div>
    <div style={{
      // position: 'absolute',
      // bottom: 80,
      // left: 0,
      // right: 0,
      width: '100%',
      paddingBottom: 30
    }}>
      {/* <Divider /> */}
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button shape="circle" size="large" icon={<LeftOutlined />} onClick={() => prevStep()} disabled={current === 0}>
        </Button>
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Complete
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button shape="circle" type="primary" size="large" icon={<RightOutlined />} onClick={() => nextStep()}>
          </Button>
        )}
      </Space>

    </div>
  </Container>
}

OrgOnBoardWizard.propTypes = {};

OrgOnBoardWizard.defaultProps = {};

export default withRouter(OrgOnBoardWizard);
