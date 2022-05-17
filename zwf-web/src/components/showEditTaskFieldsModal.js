import React from 'react';
import { Modal, Typography, Input, Row, Col, Button, Form, Avatar, Divider } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl, renameTask$, saveTask$ } from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import Icon, { ShareAltOutlined } from '@ant-design/icons';
import { MdDriveFileRenameOutline } from 'react-icons/md'
import { RiInsertRowBottom } from 'react-icons/ri';
import { TaskTemplateFieldsEditor } from 'pages/TaskTemplate/formBuilder/TaskTemplateFieldsEditor';

const { Text, Paragraph } = Typography;

const Content = props => {
  const { task, onOk, handlerExecutor } = props;
  const formRef = React.createRef();

  React.useEffect(() => {
    handlerExecutor.set(handleSaveTaskFields)
  }, []);
  
  const handleSaveTaskFields = async () => {
    await formRef.current.validateFields();
    const values = formRef.current.getFieldsValue();
    debugger;
    // renameTask$(id, values).subscribe(() => {
    //   onOk();
    // })
  }

  return <>
    <Form
      ref={formRef}
      initialValues={task}
      onFinish={handleSaveTaskFields}
      style={{ marginTop: 20 }}
    >
      <Form.Item name="fields" rules={[{ required: true, validator: async (rule, value) => {
        if(!value?.length) {
          throw new Error('fields cannot be empty.')
        }
      } }]}>
        <TaskTemplateFieldsEditor />
      </Form.Item>
    </Form>
    <Divider />
  </>
}

class HandlerExecutor {
  handler;

  set = (handlerFn) => {
    this.handler = handlerFn;
  }

  execute = async () => {
    await this.handler?.();
  }
}

export function showEditTaskFieldsModal(task, onOk) {

  const handlerExecutor = new HandlerExecutor();

  const modalRef = Modal.confirm({
    title: <><Avatar icon={<Icon component={() => <RiInsertRowBottom />} />} style={{backgroundColor: '#37AFD2'}}/>  Edit task fields</>,
    content: <Content task={task}
      onOk={() => {
        modalRef.destroy();
        if(onOk()) {

        }
      }} handlerExecutor={handlerExecutor} />,
    afterClose: () => {
    },
    icon: null,
    width: 800,
    closable: true,
    maskClosable: false,
    destroyOnClose: true,
    focusTriggerAfterClose: true,
    okText: 'Save',
    autoFocusButton: null,
    cancelButtonProps: {
      type: 'text'
    },
    onOk: async (close) => {
      await handlerExecutor.execute();
    }

    // okButtonProps: {
    //   style: {
    //     display: 'none'
    //   }
    // }
  });

  return modalRef;
}
