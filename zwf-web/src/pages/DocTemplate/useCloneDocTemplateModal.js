import { Typography, Modal, Form, Input } from 'antd';
import React from 'react';
import { notify } from 'util/notify';
import { cloneDocTemplate$ } from 'services/docTemplateService';

const { Link: TextLink } = Typography

export const useCloneDocTemplateModal = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();

  const cloneAction = ({ targetId, name, onOk, onCancel }) => {

    const handleClone = (formValues) => {
      const { name } = formValues;
      cloneDocTemplate$(targetId, name)
        .pipe()
        .subscribe(cloned => {
          modalInstance.destroy();
          notify.success('Cloned doc template',
            <>Successfully cloned doc template. The new doc template is  <TextLink target="_self" href={`/demplate/${cloned.id}`}>{cloned.name}</TextLink></>,
            10);
          onOk?.();
        });
    }

    const modalInstance = modal.confirm({
      icon: null,
      title: 'Clone doc template',
      content: <Form
        style={{width: '100%'}}
        initialValues={{ name }}
        preserve={false}
        onFinish={handleClone}
        layout="vertical"
        form={form}
        requiredMark={false}
      >
        <Form.Item label="Name of new doc template" name="name" rules={[{ required: true, whitespace: true, max: 100 }]}
          extra={`The system will create a duplicate of the document template with the specified name. In case a document with the same name already exists, the system will append a number suffix (such as "(2)") to the name.`}>
          <Input placeholder='Doc template name' allowClear/>
        </Form.Item>
      </Form>,
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      okText: 'Clone',
      cancelButtonProps: {
        type: 'text'
      },
      onOk: () => {
        form.submit()
        return true;
      },
      onCancel: () => onCancel?.(),
    });
  }

  return [cloneAction, contextHolder];
};

