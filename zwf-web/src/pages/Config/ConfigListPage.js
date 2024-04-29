import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input } from 'antd';
import {
  PlusOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { listConfig, saveConfig } from 'services/configService';

const { Title } = Typography;

const ContainerStyled = styled.div`
  width: 100%;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`


const NEW_ITEM = Object.freeze({
  isNew: true,
  key: '',
});

const ConfigListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([{ ...NEW_ITEM }]);

  const columnDef = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: {
        compare: (a, b) => a.key.localeCompare(b.keyy)
      },
      render: (text, item) => item.isNew ?
        <Input
          allowClear
          autoFocus
          value={text}
          onChange={e => handleNewItemKeyChange(item, e.target.value)}
        />
        : text,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      sorter: {
        compare: (a, b) => (a.value || '').localeCompare(b.value)
      },
      render: (text, item) => <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 3 }}
        value={text}
        allowClear={item.isNew}
        onChange={e => handleInputChange(item, e.target.value)}
        onBlur={e => handleInputBlur(item, e.target.value)}
      />
    },
    {
      render: (text, item) => <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        {item.isNew && <Button type="primary" ghost shape="circle" icon={<PlusOutlined />} disabled={!isItemValid(item)} onClick={() => handleSaveNew(item)} />}
      </Space>
    },
  ];

  const isItemValid = (item) => {
    return !!item.key;
  }

  const handleNewItemKeyChange = (item, keyName) => {
    item.key = keyName;
    setList([...list]);
  }

  const handleInputChange = (item, value) => {
    item.value = value;
    setList([...list]);
  }

  const handleInputBlur = async (item, value) => {
    if (item.isNew) return;
    await saveConfig(item.key, value);
    // await loadList();
  }

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await listConfig();
      data.unshift({ ...NEW_ITEM });
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);


  const handleSaveNew = async (item) => {
    if (!isItemValid(item)) return;
    try {
      setLoading(true);
      await saveConfig(item.key, item.value);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  return (
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>System Configurations</Title>
          </StyledTitleRow>
          <Table columns={columnDef}
            dataSource={list}
            size="small"
            rowKey="key"
            loading={loading}
            pagination={false}
          />
        </Space>
      </ContainerStyled>
  );
};

ConfigListPage.propTypes = {};

ConfigListPage.defaultProps = {};

export default ConfigListPage;
