import React from 'react';
import { Form, Input, Button } from "antd";
import styled from 'styled-components';
import { saveContact } from 'services/contactService';
import { notify } from 'util/notify';
import { GlobalContext } from 'contexts/GlobalContext';

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
const ContactForm = props => {


  const [loading, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { role } = context;

  const isGuest = role === 'guest';



  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    // console.log(process.env);
    try {
      setLoading(true);

      await saveContact(values);
      notify.success('Successfully sent out the message. We will reply shortly');
    } finally {
      setLoading(false);
      props.onDone();
    }
  }


  const handleCancel = () => {
    props.onDone();
  }

  return (
    <Container>
      <Form onFinish={handleSubmit} >
        {isGuest && <Form.Item name="name" rules={[{ required: true, message: 'Name is required', whitespace: true, max: 100 }]}>
          <Input autoFocus={true} placeholder="Your name" allowClear={true} maxLength={100} disabled={loading} />
        </Form.Item>}
        {isGuest && <Form.Item name="contact" rules={[{ required: true, message: 'Email or phone is required', whitespace: true, max: 100 }]}>
          <Input placeholder="Email or phone" allowClear={true} maxLength={100} disabled={loading} />
        </Form.Item>}
        <Form.Item name="message" rules={[{ required: true, message: 'Message content is required', whitespace: true, max: 1000 }]}>
          <Input.TextArea autoSize={{ minRows: 3 }} allowClear={true} maxLength={1000} disabled={loading} placeholder="Enquiry, question or bug report." />
        </Form.Item>
        <Form.Item>
          <SubmitButton block type="primary" htmlType="submit" disabled={loading}>Submit</SubmitButton>
        </Form.Item>
          <Button block type="link" onClick={handleCancel} disabled={loading}>Cancel</Button>
      </Form>
    </Container>
  );
}

ContactForm.propTypes = {};

ContactForm.defaultProps = {};

export default ContactForm;
