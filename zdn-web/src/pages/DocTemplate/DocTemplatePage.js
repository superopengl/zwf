import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, Table, Tooltip, Typography } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import DocTemplateForm from './DocTemplateForm';
import React from 'react';
import { deleteDocTemplate, listDocTemplate } from 'services/docTemplateService';
import styled from 'styled-components';

const { Text } = Typography;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
  min-width: 350px;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;
`;



export const DocTemplatePage = () => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();


  const handleEdit = (e, item) => {
    e.stopPropagation();
    setCurrentId(item.id);
    setDrawerVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Dot Template <strong>{name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteDocTemplate(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleTestDocTemplate = (e) => {
    e.stopPropagation();

  }

  const loadList = async () => {
    setLoading(true);
    const list = await listDocTemplate();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleCreateNew = () => {
    setCurrentId(undefined);
    setDrawerVisible(true);
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  }


  return (<>
    <Space direction="vertical" style={{ width: '100%' }} size="large">
          <DocTemplateForm
            id={currentId}
            onClose={() => handleDrawerClose()}
            onOk={() => { handleDrawerClose(); loadList() }}
          />
    </Space>
  </>
  );
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
