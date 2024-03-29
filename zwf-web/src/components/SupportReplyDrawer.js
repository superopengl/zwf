import { Drawer, Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getUserSupport$, sendSupportMessage$ } from 'services/supportService';
import { SupportMessageList } from 'components/SupportMessageList';
import { filter, finalize } from 'rxjs/operators';
import { SupportMessageInput } from './SupportMessageInput';
import { CloseOutlined, SyncOutlined } from '@ant-design/icons';
import { ZeventContext } from 'contexts/ZeventContext';
import { FaLaptopHouse } from 'react-icons/fa';



export const SupportReplyDrawer = React.memo((props) => {
  const { title, userId, visible, onClose } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const { onNewZevent$ } = React.useContext(ZeventContext);

  React.useEffect(() => {
    const sub$ = onNewZevent$().pipe(
      filter(z => z.type === 'support'),
      filter(z => z.userId === userId),
    ).subscribe(z => {
      setList(pre => [...pre, z.payload]);
    });

    return () => sub$.unsubscribe()
  }, [userId]);

  React.useEffect(() => {
    if (!userId) {
      setLoading(false)
      return;
    }
    if (visible) {
      const sub$ = load$();
      return () => sub$.unsubscribe()
    }

  }, [userId, visible]);

  const load$ = () => {
    setLoading(true)
    return getUserSupport$(userId).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setList)
  }

  const handleSubmitMessage = (message) => {
    return sendSupportMessage$(message, null, userId);
  }

  const handleReload = () => {
    load$();
  }

  return <Drawer
    open={visible}
    onClose={onClose}
    title={title}
    destroyOnClose
    closable={false}
    autoFocus
    maskClosable
    // width={500}
    extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
    bodyStyle={{ padding: 0, height: 'calc(100vh - 55px)' }}
    footerStyle={{ padding: 0 }}
    footer={<SupportMessageInput loading={loading} onSubmit={handleSubmitMessage} />}
  >
    <SupportMessageList dataSource={list} loading={loading} />
  </Drawer>
});

SupportReplyDrawer.propTypes = {
  userId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

SupportReplyDrawer.defaultProps = {
  visible: false,
  onClose: () => { },
};

