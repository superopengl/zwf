import React from 'react';
import styled from 'styled-components';

import { Typography, Button, Form, Input, Modal } from 'antd';
import { signUpOrg$ } from 'services/authService';
import { notify } from 'util/notify';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
const { Title, Text, Paragraph } = Typography;


const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;

  .ant-typography {
    // color: rgba(255,255,255,0.8);

    // a {
    //   color: rgba(255,255,255,0.6);
    // }
  }

`;

const OrgSignUpForm = (props) => {

  const { onOk } = props;

  const intl = useIntl();
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = (values) => {
    if (loading) {
      return;
    }

    setLoading(true);

    const { email } = values;

    signUpOrg$(email).subscribe(
      () => {
        Modal.success({
          title: '🎉 Successfully signed up!',
          content: <>
            <Paragraph>
              Thank you very much for signing up ZeeWorkflow. We will send out the registration to <Text strong>{email}</Text>.
            </Paragraph>
            <Paragraph>
              If you cannot receieve the verification email within 30 minutes, please check your spam box, whether the email address is valid, or if the email address has been registered in ZeeWorkflow before, in which case, you may use forgot password to find back your credential.
            </Paragraph>
          </>,
          okText: 'Go To Homepage',
          onOk: onOk,
          onCancel: onOk,
          maskClosable: false,
          closable: false,
          destroyOnClose: true,
        })
      }
    ).add(() => {
      setLoading(false)
    });
  }

  return (
    <ContainerStyled>
      <Title level={2}>
        <FormattedMessage id="menu.signUpOrg" />
      </Title>
      <Form layout="vertical" onFinish={handleSignIn} style={{ textAlign: 'left' }} initialValues={{ role: 'member' }}>
        <Form.Item>
          <Text>
            We will send an verification email to below email address. This email address will be the account of the root administrator of the organasation.
          </Text>
        </Form.Item>
        <Form.Item label="" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
          <Input placeholder={intl.formatMessage({ id: 'placeholder.rootEmailAddress' })} type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
        </Form.Item>
        {/* <Form.Item label="" name="agreement" valuePropName="checked" style={{ marginBottom: 0 }} rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox disabled={sending}>I have read and agree to the <a target="_blank" href="/terms_and_conditions">terms & conditions</a> and <a target="_blank" href="/privacy_policy">privacy policy</a>.</Checkbox>
        </Form.Item> */}
        <Text>
          <FormattedMessage id="text.byClickingAgreement"
            values={{
              tc: <a target="_blank" href="/terms_and_conditions">
                <FormattedMessage id="menu.tc" />
              </a>,
              pp: <a target="_blank" href="/privacy_policy">
                <FormattedMessage id="menu.pp" />
              </a>
            }}
          />
        </Text>
        <Form.Item style={{ marginTop: '1rem' }}>
          <Button block type="primary" htmlType="submit" disabled={loading}>
            <FormattedMessage id="menu.signUpOrg" />
          </Button>
        </Form.Item>
        {/* <Form.Item>
                  <Button block type="link" onClick={() => goBack()}>Cancel</Button>
                </Form.Item> */}
        {/* <Form.Item>
          <Text type="secondary">
            If you cannot receieve the verification email within 30 minutes, please check if the email address is valid or if the email address has been registered in ZeeWorkflow before, in which case, you may use forgot password to find back your credential.
          </Text>
        </Form.Item> */}
      </Form>
    </ContainerStyled>
  );
}

OrgSignUpForm.propTypes = {};

OrgSignUpForm.defaultProps = {};

export default OrgSignUpForm;
