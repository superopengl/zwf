import { Drawer, Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskTrackings$ } from 'services/taskService';
import { TaskTrackingPanel } from './TaskTrackingPanel';
import { TaskMessageForm } from './TaskMessageForm';
import { listMyContact$, listUserContact$, subscribeUserContactChange, sendContact$ } from 'services/contactService';
import { ContactMessageList } from 'components/ContactMessageList';
import { filter, finalize, tap } from 'rxjs/operators';
import { ContactMessageInput } from './ContactMessageInput';
import { SyncOutlined } from '@ant-design/icons';



export const AdminReplyContactDrawer = React.memo((props) => {
  const { title, userId, visible, onClose, eventSource } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

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

  React.useEffect(() => {
    const sub$ = eventSource.pipe(
      // tap(e => {
      //   debugger;
      // }),
      filter(e => {
        // debugger;
        return e.userId === userId
      })
    ).subscribe(event => {
      setList(list => {
        return [...(list ?? []), event]
      });
    });

    return () => sub$.unsubscribe()
  }, [userId]);

  const load$ = () => {
    setLoading(true)
    return listUserContact$(userId).pipe(
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
    visible={visible}
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
    footer={<ContactMessageInput loading={loading} onSubmit={handleSubmitMessage} />}
  >
    <ContactMessageList dataSource={list} loading={loading} />
  </Drawer>
});

AdminReplyContactDrawer.propTypes = {
  userId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  eventSource: PropTypes.object.isRequired,
};

AdminReplyContactDrawer.defaultProps = {
  visible: false,
  onClose: () => { },
};

