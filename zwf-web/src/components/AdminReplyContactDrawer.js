import { Drawer, Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskTrackings$ } from 'services/taskService';
import { TaskTrackingPanel } from './TaskTrackingPanel';
import { TaskMessageForm } from './TaskMessageForm';
import { listMyContact$, listUserContact$, subscribeUserContactChange, sendContact$ } from 'services/contactService';
import { ContactMessageList } from 'components/ContactMessageList';
import { finalize } from 'rxjs/operators';
import { ContactMessageInput } from './ContactMessageInput';
import { SyncOutlined } from '@ant-design/icons';



export const AdminReplyContactDrawer = React.memo((props) => {
  const { userId, visible, onClose, eventSource } = props;
  const [loading, setLoading] = React.useState(true);
  const [chatDataSource, setChatDataSource] = React.useState([]);

  React.useEffect(() => {
    if (!userId) {
      setLoading(false)
      return;
    }
    const sub$ = load$();

    return () => sub$.unsubscribe()
  }, [userId]);

  React.useEffect(() => {
    if (!userId) {
      setLoading(false)
      return;
    }
    const sub$ = load$();

    const eventSource = subscribeUserContactChange(userId);
    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data);
      setChatDataSource(list => {
        return [...(list ?? []), event]
      });
    }

    return () => {
      sub$.unsubscribe();
      eventSource?.close();
    }

  }, [userId]);

  const load$ = () => {
    setLoading(true)
    return listUserContact$(userId).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setChatDataSource)
  }

  const handleSubmitMessage = (message) => {
    return sendContact$(message, null, userId);
  }

  const handleReload = () => {
    load$();
  }

  return <Drawer
    visible={visible}
    onClose={onClose}
    title="Reply Contact"
    destroyOnClose
    closable={false}
    autoFocus
    maskClosable
    width={500}
    extra={<Button icon={<SyncOutlined />} onClick={handleReload} />}
    bodyStyle={{ padding: 0, height: 'calc(100vh - 55px)' }}
    footer={<ContactMessageInput loading={loading} onSubmit={handleSubmitMessage} />}
  >
    <ContactMessageList dataSource={chatDataSource} loading={loading} />
  </Drawer>
});

AdminReplyContactDrawer.propTypes = {
  userId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  eventSource: PropTypes.object,
};

AdminReplyContactDrawer.defaultProps = {
  visible: false,
  onClose: () => { },
};

