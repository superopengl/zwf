import React from 'react';
import { Form, Input, Button } from "antd";
import styled from 'styled-components';
import { saveContact } from 'services/contactService';
import { notify } from 'util/notify';

const Container = styled.div`
margin-left: auto;
margin-right: auto;
text-align: left;

p {
  color: #ffffff;

}
`;

const SubmitButton = styled(Button)`
border-width: 2px;
// border-radius: 20px;

&:hover {
  border-color: white;
  color: white;
}
`;
// import emailjs from 'emailjs-com';
class ContactForm extends React.Component {

  initialValues = {
    name2: '',
    reply: '',
    message: ''
  };

  formRef = React.createRef();

  constructor(props) {
    super(props);

    this.firstInputRef = React.createRef();

    this.state = {
      sending: false
    }
  }

  focus() {
    this.firstInputRef.focus();
  }

  handleSubmit = async values => {
    if (this.state.sending) {
      return;
    }

    // console.log(process.env);
    try {
      this.setState({ sending: true });

      await saveContact(values);
      notify.success('Successfully sent out the message. We will reply shortly');
      this.reset();
    } catch (e) {
      notify.error('Failed to send out message');
      // console.error(e);
    } finally {
      this.setState({ sending: false }, () => this.props.onDone());
    }
  }

  reset = () => {
    // console.log('reset triggered');
    this.formRef.current.resetFields();
  }

  handleCancel = () => {
    this.props.onDone();
  }

  render() {
    const { sending } = this.state;

    return (
      <Container>
        <Form onFinish={this.handleSubmit} ref={this.formRef}>
          <Form.Item name="name" rules={[{ required: true, message: 'Name is required', whitespace: true, max: 100 }]}>
            <Input autoFocus={true} placeholder="Your name" allowClear={true} maxLength={100} disabled={sending} />
          </Form.Item>
          <Form.Item name="company" rules={[{ required: false, whitespace: true, max: 100 }]}>
            <Input placeholder="Company" allowClear={true} maxLength={100} disabled={sending} />
          </Form.Item>
          <Form.Item name="contact" rules={[{ required: true, message: 'Email or phone is required', whitespace: true, max: 100 }]}>
            <Input placeholder="Email or phone" allowClear={true} maxLength={100} disabled={sending} />
          </Form.Item>
          <Form.Item name="message" rules={[{ required: true, message: 'Message content is required', whitespace: true, max: 1000 }]}>
            <Input.TextArea autoSize={{ minRows: 3 }} allowClear={true} maxLength={1000} disabled={sending} placeholder="Message" />
          </Form.Item>
          <Form.Item>
            <SubmitButton block type="primary" htmlType="submit" disabled={sending}>Submit</SubmitButton>
          </Form.Item>
          <Form.Item>
            <Button block type="link" onClick={this.handleCancel} disabled={sending}>Cancel</Button>
          </Form.Item>
        </Form>
      </Container>
    );
  }
}

ContactForm.propTypes = {};

ContactForm.defaultProps = {};

export default ContactForm;
