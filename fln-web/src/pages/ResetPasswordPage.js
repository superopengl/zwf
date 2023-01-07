import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Divider, Layout } from 'antd';
import { Logo } from 'components/Logo';
import * as queryString from 'query-string';
import { resetPassword } from 'services/authService';
import { notify } from 'util/notify';

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
  max-width: 300px;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
class ResetPasswordPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sending: false
    }
  }

  goBack = () => {
    this.props.history.goBack();
  }

  handleSubmit = async values => {
    if (this.state.sending) {
      return;
    }

    try {
      this.setState({ sending: true });
      const { password } = values;
      const { token } = queryString.parse(this.props.location.search);

      await resetPassword(token, password);

      notify.success('Successfully reset password');

      // Go back to home page
      this.setState({ sending: false }, () => this.props.history.push('/'));
    } catch (e) {
      this.setState({ sending: false });
    }
  }

  validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator(value) {
        if (getFieldValue('password') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }

  render() {
    const { sending } = this.state;

    return <LayoutStyled>
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={2}>Reset Password</Title>
        <Form layout="vertical" onFinish={this.handleSubmit} style={{ textAlign: 'left' }}>
          <Form.Item label="Password (at least 8 letters)" name="password" rules={[{ required: true, min: 8, message: ' ' }]}>
            <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} autoFocus={true} />
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 8, message: ' ' }, this.validateConfirmPasswordRule]}>
            <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} />
          </Form.Item>
          <Form.Item style={{ marginTop: '2rem' }}>
            <Button block type="primary" htmlType="submit" disabled={sending}>Reset Password</Button>
          </Form.Item>
          <Form.Item>
            <Button block type="link" onClick={() => this.goBack()}>Cancel</Button>
          </Form.Item>
        </Form>
        <Divider />
        <Link to="/"><Button block type="link">Go to home page</Button></Link>
      </ContainerStyled>
    </LayoutStyled>
  }
}

ResetPasswordPage.propTypes = {};

ResetPasswordPage.defaultProps = {};

export default withRouter(ResetPasswordPage);
