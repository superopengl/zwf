import Icon, {
  CloseOutlined, EditOutlined, PlusOutlined, CopyOutlined
} from '@ant-design/icons';
import { Button, Modal, Typography, Row, Col, Tooltip } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { deleteDemplate$, listDemplate$ } from 'services/demplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { DemplateIcon } from '../../components/entityIcon';
import { useNavigate, Link } from 'react-router-dom';
import { finalize, switchMap } from 'rxjs/operators';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ProList } from '@ant-design/pro-components';
import { Descriptions } from 'antd';
import { useCloneDemplateModal } from './useCloneDemplateModal';
import { useAssertRole } from 'hooks/useAssertRole';
import { IoDuplicateOutline } from 'react-icons/io5';
import { PdfPreview } from 'components/PdfPreview';

const { Text, Paragraph, Link: TextLink } = Typography;

const Container = styled.div`
  .ant-pro-table-list-toolbar {
    display: none;
  }

  .ant-pro-card-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;



export const DemplateListPage = () => {
  useAssertRole(['admin', 'agent'])
  const [list, setList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [cloneAction, cloneContextHolder] = useCloneDemplateModal();
  const navigate = useNavigate();

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    navigate(`/demplate/${id}`);
  }

  const handleEdit = (item) => {
    handleEditOne(item.id);
  }

  const handleDelete = (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Dot Template <Text code>{name}</Text>?</>,
      onOk: () => {
        setLoading(true);
        deleteDemplate$(id).pipe(
          finalize(() => setLoading(false)),
          switchMap(() => listDemplate$()),
          finalize(() => setLoading(false)),
        ).subscribe(list => {
          setList(list);
        });
      },
      maskClosable: true,
      closable: true,
      okButtonProps: {
        danger: true
      },
      cancelButtonProps: {
        type: 'text',
      },
      okText: 'Yes, delete'
    });
  }

  React.useEffect(() => {
    setLoading(true);
    const subscription$ = listDemplate$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(list => {
        setList(list);
      });

    return () => subscription$.unsubscribe();
  }, []);


  const handleCreateNew = () => {
    navigate('/demplate/new');
  }

  const handleClone = demplate => {
    cloneAction({
      targetId: demplate.id,
      name: `Copy - ${demplate.name}`,
      onOk: () => {
        setLoading(true);
        listDemplate$().pipe(
          finalize(() => setLoading(false)),
        ).subscribe(list => {
          setList(list);
        });
      }
    })
  }

  const dataSource = filteredList.map(item => ({
    id: item.id,
    data: item,
    title: <Tooltip title={item.name} placement="topLeft">{item.name}</Tooltip>,
    avatar: <DemplateIcon />,
    content: <>
      <Descriptions size="small">
      <Descriptions.Item span={24}>
          <PdfPreview file={item.pdfBuffer} thumbnail={true} />
        </Descriptions.Item>
        <Descriptions.Item label="created" span={12}>
          <TimeAgo value={item.createdAt} showTime={false} direction="horizontal" />
        </Descriptions.Item>
        <Descriptions.Item label="updated" span={12}>
          <TimeAgo value={item.updatedAt} showTime={false} direction="horizontal" />
        </Descriptions.Item>
      </Descriptions>
    </>
  }));

  return (<Container>
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Templates'
        },
        {
          name: 'Doc Template',
        },
      ]}
      // loading={loading}
      title='Doc Templates'
      extra={[
        <Button type="primary" key="new" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Doc Template</Button>
      ]}
    >
      <ProList
        headerTitle=" "
        grid={{
          gutter: [24, 24],
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 3,
          xxl: 4
        }}
        ghost
        dataSource={dataSource}
        loading={loading}
        locale={{
          emptyText: <div style={{ margin: '30px auto' }}>
            <Paragraph type="secondary">
              There is no doc template. Let's <TextLink underline onClick={() => navigate("/demplate/new")}>create a new doc template</TextLink>!
            </Paragraph>

          </div>
        }}
        onItem={(row) => {
          return {
            onMouseEnter: () => {
            },
            onClick: () => {
              handleEdit(row.data)
            },
          };
        }}
        metas={{
          title: {},
          subTitle: {},
          type: {},
          avatar: {},
          content: {},
          actions: {
            render: (text, row) => [
              <DropdownMenu
                key="others"
                config={[
                  {
                    icon: <EditOutlined />,
                    menu: 'Edit',
                    onClick: () => handleEdit(row.data)
                  },
                  {
                    icon: <Icon component={IoDuplicateOutline} />,
                    menu: 'Duplicate',
                    onClick: () => handleClone(row.data)
                  },
                  {
                    menu: '-'
                  },
                  {
                    icon: <Text type="danger"><CloseOutlined /></Text>,
                    menu: <Text type="danger">Delete</Text>,
                    onClick: () => handleDelete(row.data)
                  }]}
              />
            ],
          },
        }}

      />
    </PageHeaderContainer>
    {cloneContextHolder}
  </Container>
  );
};

DemplateListPage.propTypes = {};

DemplateListPage.defaultProps = {};

export default DemplateListPage;
