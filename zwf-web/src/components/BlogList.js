import {
  CloseOutlined, EditOutlined
} from '@ant-design/icons';
import { Button, Tooltip, List, Typography, Space, Divider } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Card } from 'antd';

const { Title } = Typography;

const StyledList = styled(List)`
  .ant-list-item {
    padding: 1.5rem 0;
    border: none;
  }

  .ant-card-head {
    border: none;
  }
`;



const previewConfig = {
  view: {
    menu: false,
    md: false,
    html: true
  },
  canView: {
    menu: false,
    md: false,
    html: false,
    fullScreen: false,
    hideMenu: false
  }
};

export const BlogList = props => {
  const { value, readonly, onEdit, onDelete } = props;

  const handleEdit = (e, item) => {
    e.stopPropagation();
    onEdit(item);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    onDelete(item);
  }

  return (
    <StyledList
      itemLayout="vertical"
      size="large"
      dataSource={value}
      pagination={null}
      footer={null}
      renderItem={item => (
        <List.Item
          key={item.id}
        >
          <Card title={<Space direction="vertical" style={{ width: '100%' }}>
            <Title level={2}>{item.title}</Title>
            <Space style={{width: '100%', justifyContent: 'space-between'}}>
              <Space>
              <TimeAgo value={item.createdAt} prefix="Created At: " accurate={false} />
              <Divider type="vertical"/>
              <TimeAgo value={item.updatedAt} prefix="Updated At: " accurate={false} />
              </Space>
              {!readonly && <Space>
                <Tooltip key="edit" placement="bottom" title="Edit post">
                  <Button type="link"  icon={<EditOutlined />} onClick={e => handleEdit(e, item)} />
                </Tooltip>
                <Tooltip key="delete" placement="bottom" title="Delete post">
                  <Button type="link" danger icon={<CloseOutlined />} onClick={e => handleDelete(e, item)} />
                </Tooltip>
              </Space>}
            </Space>
          </Space>}
          >
            {/* <MdEditor
              value={item.md}
              readOnly={true}
              config={previewConfig}
              // style={{ height: "500px" }}
              renderHTML={(text) => mdParser.render(text)}
            /> */}
          </Card>
        </List.Item>
      )}
    />
  );
};

BlogList.propTypes = {
  readonly: PropTypes.bool,
  value: PropTypes.array.isRequired
};

BlogList.defaultProps = {
  readonly: true
};

export default BlogList;
