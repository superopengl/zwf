import { Form, Select, Typography, InputNumber, Modal, Alert, DatePicker } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
// import 'pages/AdminTask/node_modules/react-chat-elements/dist/main.css';

import { getRecurring$, saveRecurring$ } from 'services/recurringService';
import { Input } from 'antd';
import dayjs from 'dayjs';
import { OrgClientSelect } from 'components/OrgClientSelect';
import { Loading } from 'components/Loading';
import { RecurringForm } from '../pages/Recurring/RecurringForm';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { firstValueFrom, of } from 'rxjs';

const { Paragraph } = Typography;

const EMPTY_RECURRING = {
  name: 'Unnamed recurring',
}



export const useRecurringEditModal = () => {

  const [modal, contextHolder] = Modal.useModal();
  const formRef = React.useRef();

  const open = async ({ id, onOk }) => {
    const isNew = !id;

    const handleSaveRecurring = (values) => {
      const { client, ...others } = values;
      const recurring = {
        id,
        ...others,
      }

      saveRecurring$(recurring).subscribe(() => {
        onOk?.();
      });
    }

    const handleOk = () => {
      formRef.current.submit();
      return true;
    }

    const source$ = isNew ? of(EMPTY_RECURRING) : getRecurring$(id);

    source$.subscribe(item => {
      const recurring = { ...item, firstRunOn: dayjs(item.firstRunOn) };
      modal.confirm({
        icon: null,
        title: isNew ? 'New Recurring' : 'Edit Recurring',
        maskClosable: false,
        destroyOnClose: true,
        okText: 'Save',
        onOk: handleOk,
        cancelButtonProps: {
          type: 'text',
        },
        content: <RecurringForm ref={formRef} recurring={recurring} onDone={handleSaveRecurring} />
      })
    })
  }

  return [open, contextHolder];

  // const { id: propId, visible, onOk, onCancel } = props;
  // // const { name, id, fields } = value || {};
  // const [id, setId] = React.useState(propId);
  // const isNew = !id;
  // const [recurring, setRecurring] = React.useState(EMPTY_RECURRING);
  // const [loading, setLoading] = React.useState(true);
  // const formRef = React.createRef()

  // React.useEffect(() => {
  //   setId(propId);
  //   if (propId) {
  //     setLoading(true)
  //     const sub$ = getRecurring$(propId).subscribe(item => {
  //       setRecurring({ ...item, firstRunOn: dayjs(item.firstRunOn) });
  //       setLoading(false)
  //     })
  //     return () => sub$.unsubscribe();
  //   } else {
  //     setLoading(false)
  //   }
  // }, [propId]);

  // const handleSaveRecurring = async (values) => {
  //   const { client, ...others } = values;
  //   const recurring = {
  //     id,
  //     ...others,
  //   }

  //   saveRecurring$(recurring).subscribe(() => {
  //     onOk();
  //   });
  // }

  // const handleOk = () => {
  //   formRef.current.submit();
  // }


  // return <Modal
  //   title={isNew ? 'New Recurring' : 'Edit Recurring'}
  //   open={visible}
  //   closable={true}
  //   maskClosable={false}
  //   destroyOnClose={true}
  //   onOk={handleOk}
  //   onCancel={onCancel}
  //   okText="Save"
  //   cancelButtonProps={{ type: 'text' }}
  // >
  //   {/* <Paragraph type="secondary">The recurrence is scheduled for approximately 5:00 am (AEST) on the designated day.</Paragraph> */}
  //   <Alert type="info" showIcon description="The recurrence is scheduled for approximately 5:00 am (AEST) on the designated day." style={{ marginBottom: 20, marginTop: 20 }} />
  //   {!loading && <RecurringForm ref={formRef} recurring={recurring} onDone={handleSaveRecurring} />}
  //   <DebugJsonPanel value={recurring} />
  // </Modal>;
};

