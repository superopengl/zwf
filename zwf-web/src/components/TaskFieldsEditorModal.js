import React from 'react';
import { Modal, Typography, Input, Row, Col, Button, Form, Avatar, Divider } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl, renameTask$, saveTaskFields$} from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import Icon, { ShareAltOutlined } from '@ant-design/icons';
import { MdDriveFileRenameOutline } from 'react-icons/md'
import { RiInsertRowBottom } from 'react-icons/ri';
import { TaskTemplateFieldsEditor } from 'pages/TaskTemplate/formBuilder/TaskTemplateFieldsEditor';
import PropTypes from 'prop-types';

const { Text, Paragraph } = Typography;

export const TaskFieldsEditorModal = props => {
  const { visible, onOk, onCancel, task } = props;
  const formRef = React.createRef();

  const handleSaveTaskFields = async () => {
    await formRef.current.validateFields();
    const values = formRef.current.getFieldsValue();
    saveTaskFields$(task.id, values.fields).subscribe(() => {
      onOk();
    });
  }

  return <Modal
    visible={visible}
    title={<><Avatar icon={<Icon component={RiInsertRowBottom } />} style={{ backgroundColor: '#37AFD2' }} /> Edit task fields</>}
    closable={true}
    maskClosable={false}
    destroyOnClose={true}
    // footer={null}
    width={700}
    focusTriggerAfterClose={false}
    onCancel={onCancel}
    onOk={handleSaveTaskFields}
    okText="Save"
    cancelButtonProps={{
      type: 'text'
    }}
  >
    {visible && <Form
      ref={formRef}
      initialValues={task}
      onFinish={handleSaveTaskFields}
    >
      <Form.Item name="fields" noStyle rules={[{
        required: true, validator: async (rule, value) => {
          if (!value?.length) {
            throw new Error('fields cannot be empty.')
          }
        }
      }]}>
        <TaskTemplateFieldsEditor />
      </Form.Item>
    </Form>}
  </Modal>
}

TaskFieldsEditorModal.propTypes = {
  task: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
};

TaskFieldsEditorModal.defaultProps = {
  visible: false,
  onCancel: () => { },
  onOk: () => { },
};
