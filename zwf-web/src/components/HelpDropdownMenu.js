import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout$ } from 'services/authService';
import { Button, Dropdown, Modal, Typography } from 'antd';
import ProfileModal from 'pages/Profile/ProfileModal';
import AboutModal from 'pages/About/AboutModal';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import { UserAvatar } from 'components/UserAvatar';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import { CommentOutlined, QuestionCircleFilled, QuestionOutlined } from '@ant-design/icons';
import { useAuthUser } from 'hooks/useAuthUser';
import { useRole } from 'hooks/useRole';
import { SupportMessageInput } from './SupportMessageInput';
import { SupportMessageList } from './SupportMessageList';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import { useSupportChatWidget } from '../hooks/useSupportChatWidget';
import styled from 'styled-components'

const Container = styled.div`
-webkit-transform: translate3d(0,0,0);
transform: translate3d(0,0,0);
`;

const { Link } = Typography;

export const HelpDropdownMenu = React.memo((props) => {

  const { onSupportOpen } = props;


  const handleMenuItemClick = e => {
    const { key } = e;
    switch (key) {
      case 'support':
        onSupportOpen();
        break;
      default:
        break;
    }
  };

  const menu = {
    items: [
      {
        key: 'tc',
        // disabled: true,
        // icon: <QuestionCircleFilled />,
        label: <Link href="/terms_and_conditions" target="_blank">Terms and Conditions</Link>
      },
      {
        key: 'home',
        // icon: <MdOutlinePrivacyTip />,
        label: <Link href="/privacy_policy" target="_blank">Privacy Policy</Link>,
      },
      {
        type: 'divider',
      },
      {
        key: 'support',
        // icon: <CommentOutlined />,
        label: 'Chat with Support'
      },
    ],
    onClick: handleMenuItemClick,
  }

  return <Dropdown menu={menu} trigger={['click']}>
    <Button shape="circle" type="text" size="large" onClick={e => e.preventDefault()}>
      <QuestionOutlined />
    </Button>
  </Dropdown>
});
