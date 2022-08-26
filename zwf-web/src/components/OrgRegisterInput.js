import React from 'react';
import { Typography, Space, Input } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import Icon, {
  ClockCircleOutlined, SettingOutlined, TeamOutlined,
  BankOutlined, QuestionOutlined, FileOutlined, TagsOutlined, MailOutlined
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'antd';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';

const { Text } = Typography;

export const OrgRegisterInput = React.memo(props => {

  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [email, setEmail] = React.useState('');


  const handleClick = (value) => {
    const inputEmail = value.trim();
    if (inputEmail) {
      setEmail(inputEmail);
      setVisible(true);
      setLoading(true);
    }
  }

  const handleReset = () => {
    setVisible(false);
    setEmail('');
    setLoading(false)
  }


  return <>
    <Input.Search
      style={{maxWidth: '400px', }}
      size="large"
      // prefix={<MailOutlined />}
      value={email}
      onChange={e => setEmail(e.target.value)}
      placeholder="Register with email"
      enterButton="Try for free"
      loading={loading}
      onSearch={handleClick}
    />
    <Modal
      visible={visible}
      destroyOnClose
      onCancel={handleReset}
      footer={null}
    >
      <OrgSignUpForm value={email} onOk={handleReset} />
    </Modal>
  </>

});


