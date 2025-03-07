import { Drawer, Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getUserSupport$, sendContact$ } from 'services/supportService';
import { SupportMessageList } from 'components/SupportMessageList';
import { filter, finalize } from 'rxjs/operators';
import { SupportMessageInput } from './SupportMessageInput';
import { SyncOutlined } from '@ant-design/icons';
import { useZevent } from 'hooks/useZevent';



export const SupportReplyDrawer = React.memo((props) => {
  const { title, userId, visible, onClose, eventSource } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  useZevent('support', zevent => {
    if(zevent.userId === userId) {
      setList(list => {
        return [...list, zevent.payload]
      });
    }
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
    return sendContact$(message, null, userId);
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
    width={500}
    extra={<Button type="link" icon={<SyncOutlined />} onClick={handleReload} />}
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
  eventSource: PropTypes.object.isRequired,
};

SupportReplyDrawer.defaultProps = {
  visible: false,
  onClose: () => { },
};

