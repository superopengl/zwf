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

  const handleLoadTaskTags = () => listTaskTags$()

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%', justifyContent: 'center', maxWidth: 600 }}>

        <Card  type="inner"
        title="Task tags" bordered={true} style={{ width: '100%' }} bodyStyle={{padding: 0}}>
          <TagListPanel
            onLoadList={handleLoadTaskTags}
            onSave={saveTaskTag$}
            onDelete={deleteTaskTag$}
            showColor={true}
          />
        </Card>

        <Card type="inner" title="User tags" bordered={true} style={{ width: '100%' }} bodyStyle={{padding: 0}}>
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
