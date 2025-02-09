import { List, Button, Layout, Space, Row, Col, Input, Typography, Modal } from 'antd';
import React from 'react';
import { renameDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { DocTemplateEditorPanel } from './DocTemplateEditorPanel';
import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import Icon, { CloseOutlined, DeleteOutlined, EyeOutlined, QuestionOutlined, SaveFilled } from '@ant-design/icons';
import { VscOpenPreview } from 'react-icons/vsc';
import { MdOpenInNew } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { saveDocTemplate$, getDocTemplate$ } from 'services/docTemplateService';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DocTemplateIcon } from 'components/entityIcon';
import { showDocTemplatePreviewModal } from 'components/showDocTemplatePreviewModal';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-components';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ProCard } from '@ant-design/pro-components';
import { extractVarsFromDocTemplateBody } from 'util/extractVarsFromDocTemplateBody';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { renameFieldInDocTemplateBody } from 'util/renameFieldInDocTemplateBody';
import PropTypes from 'prop-types';
const { Paragraph, Text } = Typography


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;

  .ant-page-header-heading-left {
    flex: 1;

    .ant-page-header-heading-title {
      flex: 1;
    }
  }
`;

const StyledList = styled(List)`
.ant-list-item {
  padding-left: 0;
  padding-right: 0;
}
`

const EMPTY_DOC_TEMPLATE = {
  name: 'New doc template',
  description: '',
  html: ''
};


export const DocTemplateRenameFieldInput = (props) => {
  const { value: propValue, onChange, onDelete } = props;

  const [deleteVisible, setDeleteVisible] = React.useState(true);
  const [value, setValue] = React.useState(propValue);
  const [modal, contextHolder] = Modal.useModal();

  React.useEffect(() => {
    setValue(propValue);
  }, [propValue]);

  const handleRename = (newValue) => {
    setDeleteVisible(true);
    const oldName = propValue?.trim();
    const newName = newValue.trim();
    if (oldName !== newName) {
      onChange(newName);
    }
  }

  const handleDelete = () => {
    modal.confirm({
      title: <>Delete field <Text code>{propValue}</Text>?</>,
      content: <>This action will delete all the places of using field notation <Text code>{'{{'}{propValue}{'}}'}</Text>.</>,
      closable: true,
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete',
      cancelButtonProps: {
        type: 'text'
      },
      onOk: onDelete,
    })
  }

  return <Row justify="space-between" gutter={2} style={{width: '100%'}}>
    <Col flex="auto">
      <Input defaultValue={propValue?.trim()}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setDeleteVisible(false)}
        onBlur={e => handleRename(e.target.value)} />
    </Col>
    <Col>
      <Button type="text" danger icon={<CloseOutlined />} onClick={handleDelete} style={{display: deleteVisible ? undefined : 'none'}}/>
      {contextHolder}
    </Col>
  </Row>

};

DocTemplateRenameFieldInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

DocTemplateRenameFieldInput.defaultProps = {};

export default DocTemplateRenameFieldInput;
