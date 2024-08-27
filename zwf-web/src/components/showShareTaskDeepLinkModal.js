import React from 'react';
import { Modal, Typography, Input, Row, Col, Avatar, Space } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl } from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import { ShareAltOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const Content = props => {
  const { url } = props;
  const ref = React.useRef();

  React.useEffect(()=> {
    ref.current.focus({cursor: 'all'})
  }, []);

  return <>
    <Paragraph type="secondary" style={{ marginTop: '1rem' }}>
      Please make sure that it will be shared with trusted people.
    </Paragraph>
    <Paragraph type="secondary" >
      Click below link to copy to clipboard.
    </Paragraph>
    <Row >
      <Col flex={1}>
        <ClickToCopyTooltip value={url} style={{ marginTop: 20 }}>
          <Input ref={ref} autoFocus value={url} />
        </ClickToCopyTooltip>
      </Col>
    </Row>
  </>
}

export function showShareTaskDeepLinkModal(taskDeepLinkId) {
  const url = getTaskDeepLinkUrl(taskDeepLinkId);
  const modalRef = Modal.info({
    title: <Space>
    <Avatar icon={<ShareAltOutlined />} style={{ backgroundColor: '#0FBFC4' }} />
    Share this task with client or other member
  </Space>,
    content: <Content url={url} />,
    afterClose: () => {
    },
    icon: null,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    width: 600,
    focusTriggerAfterClose: true,
    okText: 'Done',
    autoFocusButton: null,
    // okButtonProps: {
    //   style: {
    //     display: 'none'
    //   }
    // }
  });

  return modalRef;
}
