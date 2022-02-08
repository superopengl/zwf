import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteUserTag$, listUserTags$, saveUserTag$ } from 'services/userTagService';
import { TagListPanel } from 'components/TagListPanel';
import styled from 'styled-components';
import { deleteTaskTag$, listTaskTags$, saveTaskTag$ } from 'services/taskTagService';
import { Card, Space } from 'antd';
import { tap } from 'rxjs/operators';
import { GlobalContext } from 'contexts/GlobalContext';

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;


  .ant-spin-nested-loading {
    width: 100%;
  }

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;

const TagsSettingPage = () => {
  const context = React.useContext(GlobalContext);
  const { updateContextTaskTags } = context;

  const handleLoadTaskTags = () => listTaskTags$().pipe(
    tap(updateContextTaskTags)
  )

  return (
    <Container>
      <Space direction="vertical" size="large" style={{ width: '100%', justifyContent: 'center', maxWidth: 600 }}>

        <Card title="Task tags" bordered={false} style={{ width: '100%' }}>
          <TagListPanel
            onLoadList={handleLoadTaskTags}
            onSave={saveTaskTag$}
            onDelete={deleteTaskTag$}
            showColor={true}
          />
        </Card>

        <Card title="User tags" bordered={false} style={{ width: '100%' }}>

          <TagListPanel
            onLoadList={listUserTags$}
            onSave={saveUserTag$}
            onDelete={deleteUserTag$}
            showColor={false}
          />
        </Card>
      </Space>
    </Container>
  );
};

TagsSettingPage.propTypes = {};

TagsSettingPage.defaultProps = {};

export default withRouter(TagsSettingPage);
