import React from 'react';
import { Button, Dropdown, Typography } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { useRole } from 'hooks/useRole';
import styled from 'styled-components'

const Container = styled.div`
-webkit-transform: translate3d(0,0,0);
transform: translate3d(0,0,0);
`;

const { Link } = Typography;

export const HelpDropdownMenu = React.memo((props) => {

  const { onSupportOpen } = props;
  const role = useRole();
  const isClient = role === 'client';


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
        label: <Link href="/terms_of_use" target="_blank">Terms of Use</Link>
      },
      {
        key: 'pp',
        // icon: <MdOutlinePrivacyTip />,
        label: <Link href="/privacy_policy" target="_blank">Privacy Policy</Link>,
      },
      isClient ? null : {
        type: 'divider',
      },
      isClient ? null : {
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
