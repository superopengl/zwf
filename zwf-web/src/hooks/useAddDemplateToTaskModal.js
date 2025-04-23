import { Typography, Modal, Form, Input } from 'antd';
import React from 'react';
import { notify } from 'util/notify';
import { cloneDemplate$ } from 'services/demplateService';
import {DemplateSelect} from 'components/DemplateSelect';
import { DebugJsonPanel } from 'components/DebugJsonPanel';

const { Link: TextLink } = Typography

export const useAddDemplateToTaskModal = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const [formValues, setFormValues] = React.useState();

  const open = ({ onChange }) => {

    // const handleClone = (formValues) => {
    //   const { name } = formValues;
    //   cloneDemplate$(targetId, name)
    //     .pipe()
    //     .subscribe(cloned => {
    //       modalInstance.destroy();
    //       notify.success('Cloned doc template',
    //         <>Successfully cloned doc template. The new doc template is  <TextLink target="_self" href={`/demplate/${cloned.id}`}>{cloned.name}</TextLink></>,
    //         10);
    //       onOk?.();
    //     });
    // }

    const handleSubmit = values => {
      onChange(values.demplateIds);
    };

    const handleValuesChange = (changedValue, values) => {
      setFormValues(values);
    };

    const modalInstance = modal.confirm({
      icon: null,
      title: 'Add Document from Doc Template',
      content: <>
        <Form
          style={{ width: '100%' }}
          // initialValues={{ name }}
          preserve={false}
          onFinish={handleSubmit}
          // onValuesChange={handleValuesChange}
          layout="vertical"
          form={form}
          requiredMark={false}
        >
          <Form.Item label="" name="demplateIds" rules={[{ required: true, whitespace: true, max: 1000, type: 'array' }]}
            extra={`The system will create a duplicate of the document template with the specified name. In case a document with the same name already exists, the system will append a number suffix (such as "(2)") to the name.`}
          >
            <DemplateSelect isMultiple={true} />
          </Form.Item>
        </Form>
        {/* <DebugJsonPanel value={formValues} /> */}
      </>,
      closable: false,
      maskClosable: false,
      destroyOnClose: true,
      okText: 'Apply',
      cancelButtonProps: {
        type: 'text'
      },
      onOk: () => {
        form.submit()
        // return true;
      },
      // onCancel: () => form.destory(),
    });
  }

  return [open, contextHolder];
};

