import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input, Divider, Tabs } from 'antd';
import { signUp$ } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { notify } from 'util/notify';
import * as queryString from 'query-string';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { TeamOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;


const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
`;

const SignUpForm = (props) => {

  const { onOk } = props;

  const intl = useIntl();
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = (values) => {
    if (loading) {
      return;
    }

    setLoading(true);

    signUp$(values).subscribe(() => {
      onOk();
      // Guest
      notify.success(
        '🎉 Successfully signed up!',
        <>Congratulations and thank you very much for signing up Filedin. The invitation email has been sent out to <Text strong>{values.email}</Text>.</>
      );
    },
      err => { },
      () => setLoading(false));
  }

  return (
    <ContainerStyled>
      <Title level={2}>
        <FormattedMessage id="menu.signUp" />
      </Title>
      <Form layout="vertical" onFinish={handleSignIn} style={{ textAlign: 'left' }} initialValues={{ role: 'member' }}>
        <Form.Item>
          <Link to="/login"><Button size="small" block type="link">
            <FormattedMessage id="text.alreadyAUserClickToLogin" />
          </Button></Link>
        </Form.Item>
        <Form.Item label="" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
          <Input placeholder={intl.formatMessage({ id: 'placeholder.emailAddress' })} type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
        </Form.Item>
        {/* <Form.Item label="" name="agreement" valuePropName="checked" style={{ marginBottom: 0 }} rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox disabled={sending}>I have read and agree to the <a target="_blank" href="/terms_and_conditions">terms & conditions</a> and <a target="_blank" href="/privacy_policy">privacy policy</a>.</Checkbox>
        </Form.Item> */}
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
        <Form.Item style={{ marginTop: '1rem' }}>
          <Button block type="primary" htmlType="submit" disabled={loading}>
            <FormattedMessage id="menu.signUp" />
          </Button>
        </Form.Item>
        {/* <Form.Item>
                  <Button block type="link" onClick={() => goBack()}>Cancel</Button>
                </Form.Item> */}
      </Form>
      {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
      <GoogleSsoButton
        render={
          renderProps => (
            <Button
              ghost
              type="primary"
              block
              icon={<GoogleLogoSvg size={16} />}
              // icon={<GoogleOutlined />}
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
            >
              <FormattedMessage id="menu.continueWithGoogle" />
            </Button>
          )}
      />
      <Divider><Text type="secondary"><small>or</small></Text></Divider>
      <Link to="/signup/org"><Button block>Create Organisation</Button></Link>
    </ContainerStyled>
  );
}

SignUpForm.propTypes = {};

SignUpForm.defaultProps = {};

export default withRouter(SignUpForm);
